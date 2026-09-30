from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.access import is_administrator
from app.models.dispositivo import Dispositivo
from app.models.lote_cafe import LoteCafe
from app.models.proceso_secado import ProcesoSecado
from app.models.suscripcion import Suscripcion
from app.models.usuario import Usuario


ACTIVE_PROCESS_STATES = {"EN_PROCESO", "PAUSADO"}


def subscription_is_active(
    subscription: Suscripcion | None,
    now: datetime | None = None,
) -> bool:
    if subscription is None or subscription.estado != "ACTIVA":
        return False
    current_time = now or datetime.now(timezone.utc)
    return subscription.fecha_fin is None or subscription.fecha_fin >= current_time


async def get_latest_subscription(
    db: AsyncSession,
    user_id: int,
) -> Suscripcion | None:
    return await db.scalar(
        select(Suscripcion)
        .where(Suscripcion.id_usuario == user_id)
        .order_by(
            Suscripcion.fecha_solicitud.desc(),
            Suscripcion.id_suscripcion.desc(),
        )
        .limit(1)
    )


async def require_active_subscription(
    db: AsyncSession,
    usuario: Usuario,
) -> Suscripcion | None:
    if is_administrator(usuario):
        return None

    subscription = await get_latest_subscription(db, usuario.id_usuario)
    if not subscription_is_active(subscription):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "Necesita una suscripción activa para utilizar esta "
                "funcionalidad"
            ),
        )
    return subscription


async def ensure_device_capacity(
    db: AsyncSession,
    usuario: Usuario,
) -> None:
    subscription = await require_active_subscription(db, usuario)
    if subscription is None:
        return

    device_count = await db.scalar(
        select(func.count(Dispositivo.id_dispositivo)).where(
            Dispositivo.id_usuario == usuario.id_usuario,
            Dispositivo.estado == "ACTIVO",
        )
    )
    if (device_count or 0) >= subscription.plan.limite_dispositivos:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "El plan contratado alcanzó su límite de dispositivos "
                "activos"
            ),
        )


async def ensure_process_capacity(
    db: AsyncSession,
    usuario: Usuario,
) -> None:
    subscription = await require_active_subscription(db, usuario)
    if subscription is None:
        return

    process_count = await db.scalar(
        select(func.count(ProcesoSecado.id_proceso))
        .join(LoteCafe, LoteCafe.id_lote == ProcesoSecado.id_lote)
        .where(
            LoteCafe.id_usuario == usuario.id_usuario,
            ProcesoSecado.estado.in_(ACTIVE_PROCESS_STATES),
        )
    )
    if (process_count or 0) >= subscription.plan.limite_procesos_activos:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "El plan contratado alcanzó su límite de procesos "
                "simultáneos"
            ),
        )
