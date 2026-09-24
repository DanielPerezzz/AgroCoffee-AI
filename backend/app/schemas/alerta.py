from datetime import datetime

from pydantic import Field

from app.schemas.common import AgroCoffeeSchema
from app.schemas.enums import NivelAlerta


class AlertaCreate(AgroCoffeeSchema):
    id_proceso: int = Field(gt=0)
    id_medicion: int | None = Field(
        default=None,
        gt=0,
    )
    tipo_alerta: str = Field(
        min_length=2,
        max_length=50,
    )
    nivel: NivelAlerta
    mensaje: str = Field(
        min_length=3,
        max_length=1000,
    )


class AlertaUpdate(AgroCoffeeSchema):
    atendida: bool


class AlertaResponse(AlertaCreate):
    id_alerta: int
    fecha_hora: datetime
    atendida: bool
    fecha_atencion: datetime | None