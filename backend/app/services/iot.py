from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dispositivo import Dispositivo
from app.models.lote_cafe import LoteCafe
from app.models.proceso_secado import ProcesoSecado


async def get_active_process_for_device(
    db: AsyncSession,
    dispositivo: Dispositivo,
) -> tuple[ProcesoSecado, LoteCafe]:
    if dispositivo.id_usuario is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El dispositivo no está asignado a un usuario",
        )

    result = await db.execute(
        select(ProcesoSecado, LoteCafe)
        .join(LoteCafe, LoteCafe.id_lote == ProcesoSecado.id_lote)
        .where(
            ProcesoSecado.id_dispositivo == dispositivo.id_dispositivo,
            ProcesoSecado.estado == "EN_PROCESO",
            LoteCafe.id_usuario == dispositivo.id_usuario,
        )
        .order_by(
            ProcesoSecado.fecha_inicio.desc(),
            ProcesoSecado.id_proceso.desc(),
        )
        .limit(1)
    )
    context = result.first()
    if context is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El dispositivo no tiene un proceso de secado activo asignado",
        )

    return context[0], context[1]


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
