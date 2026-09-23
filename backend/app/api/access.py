from fastapi import HTTPException, status

from app.models.usuario import Usuario


def is_administrator(usuario: Usuario) -> bool:
    return usuario.rol == "ADMINISTRADOR"


def ensure_owner_or_admin(
    owner_id: int | None,
    usuario: Usuario,
    resource_name: str = "recurso",
) -> None:
    if not is_administrator(usuario) and owner_id != usuario.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"No tiene permisos para acceder a este {resource_name}",
        )
