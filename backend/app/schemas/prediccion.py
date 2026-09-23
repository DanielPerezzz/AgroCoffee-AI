from datetime import datetime
from decimal import Decimal

from pydantic import Field

from app.schemas.common import AgroCoffeeSchema
from app.schemas.enums import EstadoSecado


class PrediccionCreate(AgroCoffeeSchema):
    id_medicion: int = Field(gt=0)
    estado_secado: EstadoSecado

    tiempo_restante_horas: Decimal | None = Field(
        default=None,
        ge=0,
        max_digits=10,
        decimal_places=2,
    )
    nivel_confianza: Decimal | None = Field(
        default=None,
        ge=0,
        le=100,
        max_digits=5,
        decimal_places=2,
    )
    recomendacion: str | None = Field(
        default=None,
        max_length=1000,
    )
    modelo_version: str | None = Field(
        default=None,
        max_length=50,
    )


class PrediccionResponse(PrediccionCreate):
    id_prediccion: int
    fecha: datetime