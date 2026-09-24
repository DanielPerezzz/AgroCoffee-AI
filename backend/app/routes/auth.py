from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import func, select, update
from sqlalchemy.exc import IntegrityError

from app.api.dependencies import CurrentUser, DatabaseSession
from app.core.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.refresh_token import RefreshToken
from app.models.usuario import Usuario
from app.schemas.auth import (
    ChangePasswordRequest,
    LogoutRequest,
    MessageResponse,
    RefreshTokenRequest,
    TokenResponse,
)
from app.schemas.usuario import UsuarioRegister, UsuarioResponse


router = APIRouter(
    prefix="/auth",
    tags=["Autenticación"],
)


def unauthorized_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Correo o contraseña incorrectos",
        headers={"WWW-Authenticate": "Bearer"},
    )


def build_token_response(
    usuario: Usuario,
) -> tuple[TokenResponse, RefreshToken]:
    access_token, _ = create_access_token(
        subject=usuario.id_usuario,
        role=usuario.rol,
    )
    refresh_token, refresh_expires_at = create_refresh_token(
        subject=usuario.id_usuario,
        role=usuario.rol,
    )

    stored_refresh_token = RefreshToken(
        id_usuario=usuario.id_usuario,
        token_hash=hash_token(refresh_token),
        expira_en=refresh_expires_at,
    )

    response = TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )

    return response, stored_refresh_token


@router.post(
    "/register",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    data: UsuarioRegister,
    db: DatabaseSession,
) -> Usuario:
    correo = str(data.correo).lower()
    existing_user = await db.scalar(
        select(Usuario).where(Usuario.correo == correo)
    )

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese correo",
        )

    user_count = await db.scalar(
        select(func.count(Usuario.id_usuario))
    )
    rol = "ADMINISTRADOR" if user_count == 0 else "PRODUCTOR"

    usuario = Usuario(
        nombre=data.nombre,
        correo=correo,
        password_hash=hash_password(data.password),
        rol=rol,
    )
    db.add(usuario)

    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No fue posible registrar el usuario",
        ) from error

    await db.refresh(usuario)
    return usuario


@router.post(
    "/login",
    response_model=TokenResponse,
)
async def login(
    form_data: Annotated[
        OAuth2PasswordRequestForm,
        Depends(),
    ],
    db: DatabaseSession,
) -> TokenResponse:
    correo = form_data.username.lower()
    usuario = await db.scalar(
        select(Usuario).where(Usuario.correo == correo)
    )

    if usuario is None or not verify_password(
        form_data.password,
        usuario.password_hash,
    ):
        raise unauthorized_exception()

    if usuario.estado != "ACTIVO":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El usuario se encuentra inactivo",
        )

    response, stored_refresh_token = build_token_response(usuario)
    db.add(stored_refresh_token)
    await db.commit()

    return response


@router.post(
    "/refresh",
    response_model=TokenResponse,
)
async def refresh_access_token(
    data: RefreshTokenRequest,
    db: DatabaseSession,
) -> TokenResponse:
    payload = decode_token(
        data.refresh_token,
        expected_type="refresh",
    )

    if payload is None:
        raise unauthorized_exception()

    stored_token = await db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_token(data.refresh_token),
            RefreshToken.revocado_en.is_(None),
        )
    )

    now = datetime.now(timezone.utc)

    if stored_token is None or stored_token.expira_en <= now:
        raise unauthorized_exception()

    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError) as error:
        raise unauthorized_exception() from error

    usuario = await db.get(Usuario, user_id)

    if usuario is None or usuario.estado != "ACTIVO":
        raise unauthorized_exception()

    stored_token.revocado_en = now
    response, new_stored_token = build_token_response(usuario)
    db.add(new_stored_token)
    await db.commit()

    return response


@router.post(
    "/logout",
    response_model=MessageResponse,
)
async def logout(
    data: LogoutRequest,
    db: DatabaseSession,
) -> MessageResponse:
    stored_token = await db.scalar(
        select(RefreshToken).where(
            RefreshToken.token_hash == hash_token(data.refresh_token),
            RefreshToken.revocado_en.is_(None),
        )
    )

    if stored_token is not None:
        stored_token.revocado_en = datetime.now(timezone.utc)
        await db.commit()

    return MessageResponse(message="Sesión cerrada correctamente")


@router.get(
    "/me",
    response_model=UsuarioResponse,
)
async def read_current_user(
    current_user: CurrentUser,
) -> Usuario:
    return current_user


@router.post(
    "/change-password",
    response_model=MessageResponse,
)
async def change_password(
    data: ChangePasswordRequest,
    current_user: CurrentUser,
    db: DatabaseSession,
) -> MessageResponse:
    if not verify_password(
        data.current_password,
        current_user.password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La contraseña actual es incorrecta",
        )

    if data.current_password == data.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nueva contraseña debe ser diferente",
        )

    now = datetime.now(timezone.utc)
    current_user.password_hash = hash_password(data.new_password)

    await db.execute(
        update(RefreshToken)
        .where(
            RefreshToken.id_usuario == current_user.id_usuario,
            RefreshToken.revocado_en.is_(None),
        )
        .values(revocado_en=now)
    )
    await db.commit()

    return MessageResponse(
        message="Contraseña actualizada correctamente",
    )
