from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.security import decode_token
from app.db.database import get_db
from app.models.usuario import Usuario


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.api_v1_prefix}/auth/login",
)

DatabaseSession = Annotated[AsyncSession, Depends(get_db)]
AccessToken = Annotated[str, Depends(oauth2_scheme)]


async def get_current_user(
    token: AccessToken,
    db: DatabaseSession,
) -> Usuario:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_token(
        token,
        expected_type="access",
    )

    if payload is None:
        raise credentials_error

    try:
        user_id = int(payload["sub"])
    except (KeyError, TypeError, ValueError) as error:
        raise credentials_error from error

    usuario = await db.get(Usuario, user_id)

    if usuario is None or usuario.estado != "ACTIVO":
        raise credentials_error

    return usuario


CurrentUser = Annotated[Usuario, Depends(get_current_user)]


def require_roles(*roles: str):
    async def role_checker(
        current_user: CurrentUser,
    ) -> Usuario:
        if current_user.rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tiene permisos para realizar esta acción",
            )

        return current_user

    return role_checker
