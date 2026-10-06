from datetime import datetime, timedelta, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError

from app.api.access import ensure_owner_or_admin
from app.api.dependencies import (
    CurrentUser,
    DatabaseSession,
    require_roles,
)
from app.models.plan_suscripcion import PlanSuscripcion
from app.models.suscripcion import Suscripcion
from app.models.usuario import Usuario
from app.schemas.enums import EstadoSuscripcion
from app.schemas.suscripcion import (
    PlanSuscripcionResponse,
    SuscripcionAdminResponse,
    SuscripcionCreate,
    SuscripcionEstadoUpdate,
    SuscripcionResponse,
)
from app.services.subscriptions import (
    allowed_subscription_transitions,
    get_latest_subscription,
    subscription_transition_is_allowed,
)


plan_router = APIRouter(prefix="/planes", tags=["Planes de suscripción"])
router = APIRouter(prefix="/suscripciones", tags=["Suscripciones"])

PENDING_STATES = {
    "SOLICITADA",
    "EN_REVISION",
    "APROBADA",
    "INSTALACION_PROGRAMADA",
    "ACTIVA",
}


async def get_subscription_or_404(
    subscription_id: int,
    db: DatabaseSession,
) -> Suscripcion:
    subscription = await db.get(Suscripcion, subscription_id)
    if subscription is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Suscripción no encontrada",
        )
    return subscription


@plan_router.get("", response_model=list[PlanSuscripcionResponse])
async def list_subscription_plans(
    db: DatabaseSession,
    current_user: CurrentUser,
) -> list[PlanSuscripcion]:
    del current_user
    result = await db.scalars(
        select(PlanSuscripcion)
        .where(PlanSuscripcion.activo.is_(True))
        .order_by(PlanSuscripcion.precio_mensual)
    )
    return list(result)


@router.get(
    "/actual",
    response_model=SuscripcionResponse | None,
)
async def read_current_subscription(
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Suscripcion | None:
    return await get_latest_subscription(db, current_user.id_usuario)


@router.post(
    "",
    response_model=SuscripcionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def request_subscription(
    data: SuscripcionCreate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Suscripcion:
    plan = await db.get(PlanSuscripcion, data.id_plan)
    if plan is None or not plan.activo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de suscripción no encontrado",
        )

    existing = await get_latest_subscription(db, current_user.id_usuario)
    if existing is not None and existing.estado in PENDING_STATES:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una suscripción vigente o en trámite",
        )

    subscription = Suscripcion(
        id_usuario=current_user.id_usuario,
        id_plan=plan.id_plan,
        estado="SOLICITADA",
        plan=plan,
    )
    db.add(subscription)
    try:
        await db.commit()
    except IntegrityError as error:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No fue posible registrar la solicitud",
        ) from error

    await db.refresh(subscription)
    return subscription


@router.get(
    "",
    response_model=list[SuscripcionAdminResponse],
)
async def list_subscriptions(
    db: DatabaseSession,
    administrator: Annotated[
        Usuario,
        Depends(require_roles("ADMINISTRADOR")),
    ],
) -> list[Suscripcion]:
    del administrator
    result = await db.scalars(
        select(Suscripcion).order_by(Suscripcion.fecha_solicitud.desc())
    )
    return list(result)


@router.get(
    "/{subscription_id}",
    response_model=SuscripcionResponse,
)
async def read_subscription(
    subscription_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Suscripcion:
    subscription = await get_subscription_or_404(subscription_id, db)
    ensure_owner_or_admin(
        subscription.id_usuario,
        current_user,
        "suscripción",
    )
    return subscription


@router.patch(
    "/{subscription_id}/estado",
    response_model=SuscripcionAdminResponse,
)
async def update_subscription_status(
    subscription_id: int,
    data: SuscripcionEstadoUpdate,
    db: DatabaseSession,
    administrator: Annotated[
        Usuario,
        Depends(require_roles("ADMINISTRADOR")),
    ],
) -> Suscripcion:
    del administrator
    subscription = await get_subscription_or_404(subscription_id, db)
    now = datetime.now(timezone.utc)
    new_state = EstadoSuscripcion(data.estado).value
    if not subscription_transition_is_allowed(subscription.estado, new_state):
        allowed = allowed_subscription_transitions(subscription.estado)
        allowed_text = ", ".join(allowed) if allowed else "ninguno"
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"No se puede cambiar de {subscription.estado} a "
                f"{new_state}. Estados permitidos: {allowed_text}"
            ),
        )
    subscription.estado = new_state

    if new_state in {
        "APROBADA",
        "INSTALACION_PROGRAMADA",
        "ACTIVA",
    } and subscription.codigo_contrato is None:
        subscription.codigo_contrato = (
            f"AGC-{now.year}-{subscription.id_suscripcion:05d}"
        )

    if new_state == "ACTIVA":
        subscription.fecha_inicio = subscription.fecha_inicio or now
        subscription.fecha_fin = now + timedelta(days=30)

    await db.commit()
    await db.refresh(subscription)
    return subscription
