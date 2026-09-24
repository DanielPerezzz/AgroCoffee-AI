from fastapi import HTTPException, status

from app.models.dispositivo import Dispositivo
from app.models.lote_cafe import LoteCafe
from app.models.proceso_secado import ProcesoSecado


def validate_iot_context(
    dispositivo: Dispositivo,
    proceso: ProcesoSecado,
    lote: LoteCafe,
    requested_device_id: int,
) -> None:
    if dispositivo.id_dispositivo != requested_device_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="La clave no corresponde al dispositivo indicado",
        )

    if dispositivo.id_usuario is None or dispositivo.id_usuario != lote.id_usuario:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El dispositivo no pertenece al propietario del proceso",
        )

    if proceso.estado != "EN_PROCESO":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El proceso de secado no se encuentra activo",
        )
