from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.access import ensure_owner_or_admin, is_administrator
from app.api.dependencies import CurrentUser, DatabaseSession
from app.models.alerta import Alerta
from app.models.lote_cafe import LoteCafe
from app.models.proceso_secado import ProcesoSecado
from app.schemas.alerta import AlertaResponse, AlertaUpdate


router = APIRouter(prefix="/alertas", tags=["Alertas"])


async def get_alert_context(
    alert_id: int,
    db: DatabaseSession,
) -> tuple[Alerta, LoteCafe]:
    alerta = await db.get(Alerta, alert_id)
    if alerta is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Alerta no encontrada",
        )
    proceso = await db.get(ProcesoSecado, alerta.id_proceso)
    lote = await db.get(LoteCafe, proceso.id_lote) if proceso else None
    if lote is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No fue posible determinar el propietario de la alerta",
        )
    return alerta, lote


@router.get("", response_model=list[AlertaResponse])
async def list_alerts(
    db: DatabaseSession,
    current_user: CurrentUser,
    process_id: int | None = None,
    attended: bool | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Alerta]:
    query = select(Alerta).join(ProcesoSecado).join(LoteCafe)
    if not is_administrator(current_user):
        query = query.where(LoteCafe.id_usuario == current_user.id_usuario)
    if process_id is not None:
        query = query.where(Alerta.id_proceso == process_id)
    if attended is not None:
        query = query.where(Alerta.atendida == attended)

    result = await db.scalars(
        query.order_by(Alerta.fecha_hora.desc())
        .offset(max(skip, 0))
        .limit(min(max(limit, 1), 500))
    )
    return list(result)


@router.get("/{alert_id}", response_model=AlertaResponse)
async def read_alert(
    alert_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Alerta:
    alerta, lote = await get_alert_context(alert_id, db)
    ensure_owner_or_admin(lote.id_usuario, current_user, "alerta")
    return alerta


@router.patch("/{alert_id}", response_model=AlertaResponse)
async def update_alert(
    alert_id: int,
    data: AlertaUpdate,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Alerta:
    alerta, lote = await get_alert_context(alert_id, db)
    ensure_owner_or_admin(lote.id_usuario, current_user, "alerta")
    alerta.atendida = data.atendida
    alerta.fecha_atencion = datetime.now(timezone.utc) if data.atendida else None
    await db.commit()
    await db.refresh(alerta)
    return alerta
