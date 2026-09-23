import secrets

from fastapi import APIRouter, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.access import ensure_owner_or_admin, is_administrator
from app.api.dependencies import CurrentUser, DatabaseSession
from app.core.security import hash_token
from app.models.dispositivo import Dispositivo
from app.schemas.dispositivo import (
    DispositivoCreate,
    DispositivoRegistroResponse,
    DispositivoResponse,
    DispositivoUpdate,
)


router = APIRouter(prefix="/dispositivos", tags=["Dispositivos"])


async def get_device_or_404(
    device_id: int,
    db: DatabaseSession,
) -> Dispositivo:
    dispositivo = await db.get(Dispositivo, device_id)
    if dispositivo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dispositivo no encontrado",
        )
    return dispositivo


def create_device_key() -> str:
    return secrets.token_urlsafe(32)


@router.get("", response_model=list[DispositivoResponse])
async def list_devices(
    db: DatabaseSession,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 50,
) -> list[Dispositivo]:
    query = select(Dispositivo).order_by(Dispositivo.id_dispositivo)
    if not is_administrator(current_user):
        query = query.where(Dispositivo.id_usuario == current_user.id_usuario)
    result = await db.scalars(
        query.offset(max(skip, 0)).limit(min(max(limit, 1), 100))
    )
    return list(result)


@router.post(
    "",
    response_model=DispositivoRegistroResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_device(
    data: DispositivoCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> DispositivoRegistroResponse:
    api_key = create_device_key()
    dispositivo = Dispositivo(
        **data.model_dump(),
        id_usuario=current_user.id_usuario,
        api_key_hash=hash_token(api_key),
    )
    db.add(dispositivo)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un dispositivo con ese código",
        ) from error
    await db.refresh(dispositivo)
    return DispositivoRegistroResponse(
        dispositivo=dispositivo,
        api_key=api_key,
    )


@router.get("/{device_id}", response_model=DispositivoResponse)
async def read_device(
    device_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Dispositivo:
    dispositivo = await get_device_or_404(device_id, db)
    ensure_owner_or_admin(dispositivo.id_usuario, current_user, "dispositivo")
    return dispositivo


@router.patch("/{device_id}", response_model=DispositivoResponse)
async def update_device(
    device_id: int,
    data: DispositivoUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Dispositivo:
    dispositivo = await get_device_or_404(device_id, db)
    ensure_owner_or_admin(dispositivo.id_usuario, current_user, "dispositivo")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(dispositivo, field, value)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un dispositivo con ese código",
        ) from error
    await db.refresh(dispositivo)
    return dispositivo


@router.post(
    "/{device_id}/rotar-clave",
    response_model=DispositivoRegistroResponse,
)
async def rotate_device_key(
    device_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> DispositivoRegistroResponse:
    dispositivo = await get_device_or_404(device_id, db)
    ensure_owner_or_admin(dispositivo.id_usuario, current_user, "dispositivo")
    api_key = create_device_key()
    dispositivo.api_key_hash = hash_token(api_key)
    await db.commit()
    await db.refresh(dispositivo)
    return DispositivoRegistroResponse(
        dispositivo=dispositivo,
        api_key=api_key,
    )


@router.delete("/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    device_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Response:
    dispositivo = await get_device_or_404(device_id, db)
    ensure_owner_or_admin(dispositivo.id_usuario, current_user, "dispositivo")
    await db.delete(dispositivo)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El dispositivo tiene información asociada",
        ) from error
    return Response(status_code=status.HTTP_204_NO_CONTENT)
