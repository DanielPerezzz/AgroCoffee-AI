from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.access import ensure_owner_or_admin, is_administrator
from app.api.dependencies import CurrentUser, DatabaseSession
from app.models.lote_cafe import LoteCafe
from app.models.medicion import Medicion
from app.models.prediccion import Prediccion
from app.models.proceso_secado import ProcesoSecado
from app.schemas.prediccion import PrediccionResponse


router = APIRouter(prefix="/predicciones", tags=["Predicciones de IA"])


@router.get("", response_model=list[PrediccionResponse])
async def list_predictions(
    db: DatabaseSession,
    current_user: CurrentUser,
    process_id: int | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Prediccion]:
    query = (
        select(Prediccion)
        .join(Medicion)
        .join(ProcesoSecado)
        .join(LoteCafe)
    )
    if not is_administrator(current_user):
        query = query.where(LoteCafe.id_usuario == current_user.id_usuario)
    if process_id is not None:
        query = query.where(Medicion.id_proceso == process_id)

    result = await db.scalars(
        query.order_by(Prediccion.fecha.desc())
        .offset(max(skip, 0))
        .limit(min(max(limit, 1), 500))
    )
    return list(result)


@router.get("/{prediction_id}", response_model=PrediccionResponse)
async def read_prediction(
    prediction_id: int,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> Prediccion:
    prediccion = await db.get(Prediccion, prediction_id)
    if prediccion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Predicción no encontrada",
        )
    medicion = await db.get(Medicion, prediccion.id_medicion)
    proceso = await db.get(ProcesoSecado, medicion.id_proceso) if medicion else None
    lote = await db.get(LoteCafe, proceso.id_lote) if proceso else None
    if lote is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No fue posible determinar el propietario de la predicción",
        )
    ensure_owner_or_admin(lote.id_usuario, current_user, "predicción")
    return prediccion
