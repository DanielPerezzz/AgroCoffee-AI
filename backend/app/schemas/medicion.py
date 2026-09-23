from datetime import datetime
from decimal import Decimal

from pydantic import Field

from app.schemas.common import AgroCoffeeSchema


class MedicionCreate(AgroCoffeeSchema):
    id_proceso: int = Field(gt=0)
    id_dispositivo: int = Field(gt=0)

    temperatura: Decimal = Field(
        ge=-20,
        le=100,
        max_digits=6,
        decimal_places=2,
    )
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


class MedicionResponse(MedicionCreate):
    id_medicion: int
    fecha_hora: datetime