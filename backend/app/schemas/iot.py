from datetime import datetime
from decimal import Decimal

from pydantic import Field

from app.schemas.alerta import AlertaResponse
from app.schemas.common import AgroCoffeeSchema
from app.schemas.medicion import MedicionResponse
from app.schemas.prediccion import PrediccionResponse


class IoTMeasurementCreate(AgroCoffeeSchema):
    temperatura: Decimal = Field(ge=-20, le=100, max_digits=6, decimal_places=2)
    humedad_ambiental: Decimal = Field(
        ge=0,
        le=100,
        max_digits=6,
        decimal_places=2,
    )
    humedad_cafe: Decimal = Field(
        ge=0,
        le=100,
        max_digits=6,
        decimal_places=2,
    )
    luminosidad: Decimal = Field(
        ge=0,
        le=200000,
        max_digits=10,
        decimal_places=2,
    )
    tiempo_transcurrido_horas: Decimal = Field(
        ge=0,
        max_digits=10,
        decimal_places=2,
    )


class IoTContextResponse(AgroCoffeeSchema):
    id_dispositivo: int
    codigo_dispositivo: str
    id_proceso: int
    id_lote: int
    codigo_lote: str
    fecha_inicio: datetime


class IoTMeasurementResponse(AgroCoffeeSchema):
    medicion: MedicionResponse
    prediccion: PrediccionResponse
    alerta: AlertaResponse | None = None
