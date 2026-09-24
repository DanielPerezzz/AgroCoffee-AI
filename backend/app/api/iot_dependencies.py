from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy import select

from app.api.dependencies import DatabaseSession
from app.core.security import hash_token
from app.models.dispositivo import Dispositivo


device_key_header = APIKeyHeader(
    name="X-Device-Key",
    auto_error=False,
    description="Clave privada asignada al dispositivo ESP32",
)


async def get_current_device(
    db: DatabaseSession,
    api_key: Annotated[str | None, Depends(device_key_header)],
) -> Dispositivo:
    authentication_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Clave de dispositivo inválida",
        headers={"WWW-Authenticate": "ApiKey"},
    )

    if api_key is None or len(api_key) < 20:
        raise authentication_error

    dispositivo = await db.scalar(
        select(Dispositivo).where(
            Dispositivo.api_key_hash == hash_token(api_key),
            Dispositivo.estado == "ACTIVO",
        )
    )

    if dispositivo is None:
        raise authentication_error

    return dispositivo


CurrentDevice = Annotated[Dispositivo, Depends(get_current_device)]
