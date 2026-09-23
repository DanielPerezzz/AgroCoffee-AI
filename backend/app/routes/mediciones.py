from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.access import ensure_owner_or_admin, is_administrator
from app.api.dependencies import CurrentUser, DatabaseSession
from app.models.lote_cafe import LoteCafe
from app.models.medicion import Medicion
from app.models.proceso_secado import ProcesoSecado
from app.schemas.medicion import MedicionResponse


router = APIRouter(prefix="/mediciones", tags=["Mediciones"])


@router.get("", response_model=list[MedicionResponse])
async def list_measurements(
    db: DatabaseSession,
    current_user: CurrentUser,
    process_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Medicion]:
    query = (
        select(Medicion)
        .join(ProcesoSecado)
        .join(LoteCafe)
    )

    if not is_administrator(current_user):
        query = query.where(LoteCafe.id_usuario == current_user.id_usuario)

    if process_id is not None:
        query = query.where(Medicion.id_proceso == process_id)

    result = await db.scalars(
        query.order_by(Medicion.fecha_hora.desc())
        .offset(max(skip, 0))
        .limit(min(max(limit, 1), 500))
    )
    return list(result)


@router.get("/{measurement_id}", response_model=MedicionResponse)
async def read_measurement(
    measurement_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Medicion:
    medicion = await db.get(Medicion, measurement_id)
    if medicion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medición no encontrada",
        )

    proceso = await db.get(ProcesoSecado, medicion.id_proceso)
    if proceso is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Proceso de secado no encontrado",
        )

    lote = await db.get(LoteCafe, proceso.id_lote)
    if lote is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lote de café no encontrado",
        )

    ensure_owner_or_admin(lote.id_usuario, current_user, "medición")
    return medicion
