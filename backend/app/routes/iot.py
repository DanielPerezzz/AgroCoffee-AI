from fastapi import APIRouter, status

from app.api.dependencies import DatabaseSession
from app.api.iot_dependencies import CurrentDevice
from app.models.medicion import Medicion
from app.schemas.iot import (
    IoTContextResponse,
    IoTMeasurementCreate,
    IoTMeasurementResponse,
)
from app.services.iot import get_active_process_for_device, validate_iot_context
from app.services.prediction import build_prediction_records


router = APIRouter(prefix="/iot", tags=["IoT"])


@router.get(
    "/contexto",
    response_model=IoTContextResponse,
    summary="Resolver el proceso activo del dispositivo",
)
async def read_iot_context(
    db: DatabaseSession,
    current_device: CurrentDevice,
) -> IoTContextResponse:
    proceso, lote = await get_active_process_for_device(db, current_device)
    return IoTContextResponse(
        id_dispositivo=current_device.id_dispositivo,
        codigo_dispositivo=current_device.codigo,
        id_proceso=proceso.id_proceso,
        id_lote=lote.id_lote,
        codigo_lote=lote.codigo_lote,
        fecha_inicio=proceso.fecha_inicio,
    )


@router.post(
    "/mediciones",
    response_model=IoTMeasurementResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Recibir una lectura del ESP32",
)
async def receive_measurement(
    data: IoTMeasurementCreate,
    db: DatabaseSession,
    current_device: CurrentDevice,
) -> IoTMeasurementResponse:
    proceso, lote = await get_active_process_for_device(db, current_device)

    validate_iot_context(
        current_device,
        proceso,
        lote,
        current_device.id_dispositivo,
    )

    medicion = Medicion(
        id_proceso=proceso.id_proceso,
        id_dispositivo=current_device.id_dispositivo,
        **data.model_dump(),
    )
    db.add(medicion)
    await db.flush()

    prediccion, alerta = build_prediction_records(medicion)
    db.add(prediccion)
    if alerta is not None:
        db.add(alerta)

    await db.commit()
    await db.refresh(medicion)
    await db.refresh(prediccion)
    if alerta is not None:
        await db.refresh(alerta)

    return IoTMeasurementResponse(
        medicion=medicion,
        prediccion=prediccion,
        alerta=alerta,
    )
