from fastapi import APIRouter, HTTPException, status

from app.api.dependencies import DatabaseSession
from app.api.iot_dependencies import CurrentDevice
from app.models.lote_cafe import LoteCafe
from app.models.medicion import Medicion
from app.models.proceso_secado import ProcesoSecado
from app.schemas.medicion import MedicionCreate, MedicionResponse
from app.services.iot import validate_iot_context


router = APIRouter(prefix="/iot", tags=["IoT"])


@router.post(
    "/mediciones",
    response_model=MedicionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Recibir una lectura del ESP32",
)
async def receive_measurement(
    data: MedicionCreate,
    db: DatabaseSession,
    current_device: CurrentDevice,
) -> Medicion:
    proceso = await db.get(ProcesoSecado, data.id_proceso)
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

    validate_iot_context(
        current_device,
        proceso,
        lote,
        data.id_dispositivo,
    )

    medicion = Medicion(**data.model_dump())
    db.add(medicion)
    await db.commit()
    await db.refresh(medicion)
    return medicion
