from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.dependencies import (
    CurrentUser,
    DatabaseSession,
    require_roles,
)
from app.core.security import hash_password
from app.models.usuario import Usuario
from app.schemas.usuario import (
    UsuarioCreate,
    UsuarioResponse,
    UsuarioUpdate,
)


router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"],
)


async def get_user_or_404(
    user_id: int,
    db: DatabaseSession,
) -> Usuario:
    usuario = await db.get(Usuario, user_id)

    if usuario is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado",
        )

    return usuario


@router.get(
    "",
    response_model=list[UsuarioResponse],
    dependencies=[
        Depends(require_roles("ADMINISTRADOR")),
    ],
)
async def list_users(
    db: DatabaseSession,
    skip: int = 0,
    limit: int = 50,
) -> list[Usuario]:
    skip = max(skip, 0)
    limit = min(max(limit, 1), 100)

    result = await db.scalars(
        select(Usuario)
        .order_by(Usuario.id_usuario)
        .offset(skip)
        .limit(limit)
    )
    return list(result)


@router.post(
    "",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[
        Depends(require_roles("ADMINISTRADOR")),
    ],
)
async def create_user(
    data: UsuarioCreate,
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

    usuario = Usuario(
        nombre=data.nombre,
        correo=correo,
        password_hash=hash_password(data.password),
        rol=data.rol,
    )
    db.add(usuario)

    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No fue posible crear el usuario",
        ) from error

    await db.refresh(usuario)
    return usuario


@router.get(
    "/{user_id}",
    response_model=UsuarioResponse,
)
async def read_user(
    user_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Usuario:
    if (
        current_user.rol != "ADMINISTRADOR"
        and current_user.id_usuario != user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para consultar este usuario",
        )

    return await get_user_or_404(user_id, db)


@router.patch(
    "/{user_id}",
    response_model=UsuarioResponse,
)
async def update_user(
    user_id: int,
    data: UsuarioUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Usuario:
    usuario = await get_user_or_404(user_id, db)

    if (
        current_user.rol != "ADMINISTRADOR"
        and current_user.id_usuario != user_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos para modificar este usuario",
        )

    changes = data.model_dump(exclude_unset=True)

    if current_user.rol != "ADMINISTRADOR":
        forbidden_fields = {"rol", "estado"}.intersection(changes)

        if forbidden_fields:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puede modificar su rol o estado",
            )

    if "correo" in changes:
        correo = str(changes["correo"]).lower()
        existing_user = await db.scalar(
            select(Usuario).where(
                Usuario.correo == correo,
                Usuario.id_usuario != user_id,
            )
        )

        if existing_user is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Ya existe un usuario con ese correo",
            )

        changes["correo"] = correo

    for field, value in changes.items():
        setattr(usuario, field, value)

    await db.commit()
    await db.refresh(usuario)
    return usuario


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[
        Depends(require_roles("ADMINISTRADOR")),
    ],
)
async def delete_user(
    user_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Response:
    if current_user.id_usuario == user_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No puede eliminar su propio usuario",
        )

    usuario = await get_user_or_404(user_id, db)
    await db.delete(usuario)

    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "El usuario tiene recursos asociados y no puede eliminarse"
            ),
        ) from error

    return Response(status_code=status.HTTP_204_NO_CONTENT)
