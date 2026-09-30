from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.api.access import is_administrator
from app.api.dependencies import CurrentUser, DatabaseSession
from app.ml.predictor import get_model_metrics
from app.models.alerta import Alerta
from app.models.lote_cafe import LoteCafe
from app.models.medicion import Medicion
from app.models.prediccion import Prediccion
from app.models.proceso_secado import ProcesoSecado
from app.schemas.ia_chat import IAChatContext, IAChatRequest, IAChatResponse
from app.services.ai_chat import ChatSnapshot, answer_chat
from app.services.subscriptions import require_active_subscription


router = APIRouter(prefix="/ia", tags=["Modelo de IA"])


@router.get("/modelo")
async def model_information(current_user: CurrentUser) -> dict:
    return get_model_metrics()


async def _get_authorized_process(
    db: DatabaseSession,
    current_user: CurrentUser,
    process_id: int | None,
) -> ProcesoSecado:
    query = select(ProcesoSecado).join(LoteCafe)

    if process_id is not None:
        query = query.where(ProcesoSecado.id_proceso == process_id)
    if not is_administrator(current_user):
        query = query.where(LoteCafe.id_usuario == current_user.id_usuario)

    process = await db.scalar(
        query.order_by(
            ProcesoSecado.fecha_inicio.desc(),
            ProcesoSecado.id_proceso.desc(),
        ).limit(1)
    )
    if process is None:
        detail = (
            "Proceso de secado no encontrado o sin acceso"
            if process_id is not None
            else "No existe un proceso de secado disponible para consultar"
        )
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    return process


@router.post("/chat", response_model=IAChatResponse)
async def contextual_chat(
    data: IAChatRequest,
    db: DatabaseSession,
    current_user: CurrentUser,
) -> IAChatResponse:
    await require_active_subscription(db, current_user)
    process = await _get_authorized_process(
        db,
        current_user,
        data.id_proceso,
    )

    measurements = list(
        await db.scalars(
            select(Medicion)
            .where(Medicion.id_proceso == process.id_proceso)
            .order_by(Medicion.fecha_hora.desc(), Medicion.id_medicion.desc())
            .limit(5)
        )
    )
    latest_measurement = measurements[0] if measurements else None
    prediction = None
    if latest_measurement is not None:
        prediction = await db.scalar(
            select(Prediccion)
            .where(Prediccion.id_medicion == latest_measurement.id_medicion)
            .order_by(Prediccion.fecha.desc(), Prediccion.id_prediccion.desc())
            .limit(1)
        )

    alerts = list(
        await db.scalars(
            select(Alerta)
            .where(
                Alerta.id_proceso == process.id_proceso,
                Alerta.atendida.is_(False),
            )
            .order_by(Alerta.fecha_hora.desc(), Alerta.id_alerta.desc())
            .limit(20)
        )
    )

    humidity_change = None
    if len(measurements) >= 2:
        current_humidity = measurements[0].humedad_cafe
        oldest_humidity = measurements[-1].humedad_cafe
        if current_humidity is not None and oldest_humidity is not None:
            humidity_change = current_humidity - oldest_humidity

    snapshot = ChatSnapshot(
        process_id=process.id_proceso,
        process_status=process.estado,
        measurement_id=(
            latest_measurement.id_medicion if latest_measurement else None
        ),
        measurement_date=(
            latest_measurement.fecha_hora if latest_measurement else None
        ),
        temperature=(latest_measurement.temperatura if latest_measurement else None),
        ambient_humidity=(
            latest_measurement.humedad_ambiental if latest_measurement else None
        ),
        coffee_humidity=(
            latest_measurement.humedad_cafe if latest_measurement else None
        ),
        light=(latest_measurement.luminosidad if latest_measurement else None),
        elapsed_hours=(
            latest_measurement.tiempo_transcurrido_horas
            if latest_measurement
            else None
        ),
        drying_status=(prediction.estado_secado if prediction else None),
        remaining_hours=(prediction.tiempo_restante_horas if prediction else None),
        confidence=(prediction.nivel_confianza if prediction else None),
        recommendation=(prediction.recomendacion if prediction else None),
        model_version=(prediction.modelo_version if prediction else None),
        pending_alerts=len(alerts),
        latest_alert=(alerts[0].mensaje if alerts else None),
        coffee_humidity_change=humidity_change,
    )
    answer = answer_chat(data.mensaje, snapshot)

    return IAChatResponse(
        respuesta=answer.text,
        intencion=answer.intent,
        sugerencias=answer.suggestions,
        contexto=IAChatContext(
            id_proceso=process.id_proceso,
            id_medicion=snapshot.measurement_id,
            fecha_medicion=snapshot.measurement_date,
            modelo_version=snapshot.model_version,
        ),
    )
