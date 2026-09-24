from pydantic import Field

from app.schemas.common import AgroCoffeeSchema
from app.schemas.enums import EstadoGeneral


class SensorBase(AgroCoffeeSchema):
    tipo_sensor: str = Field(
        min_length=2,
        max_length=50,
    )
    nombre: str = Field(
        min_length=2,
        max_length=100,
    )
    unidad_medida: str | None = Field(
        default=None,
        max_length=30,
    )
    pin: str | None = Field(
        default=None,
        max_length=20,
    )


class SensorCreate(SensorBase):
    id_dispositivo: int = Field(gt=0)


class SensorUpdate(AgroCoffeeSchema):
    tipo_sensor: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    unidad_medida: str | None = Field(
        default=None,
        max_length=30,
    )
    pin: str | None = Field(
        default=None,
        max_length=20,
    )
    estado: EstadoGeneral | None = None


class SensorResponse(SensorBase):
    id_sensor: int
    id_dispositivo: int
    estado: EstadoGeneral