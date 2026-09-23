from datetime import datetime

from pydantic import Field, model_validator

from app.schemas.common import AgroCoffeeSchema
from app.schemas.enums import EstadoProceso


class ProcesoSecadoCreate(AgroCoffeeSchema):
    id_lote: int = Field(gt=0)
    fecha_inicio: datetime | None = None
    observaciones: str | None = Field(
        default=None,
        max_length=1000,
    )


class ProcesoSecadoUpdate(AgroCoffeeSchema):
    estado: EstadoProceso | None = None
    fecha_fin: datetime | None = None
    observaciones: str | None = Field(
        default=None,
        max_length=1000,
    )


class ProcesoSecadoResponse(AgroCoffeeSchema):
    id_proceso: int
    id_lote: int
    fecha_inicio: datetime
    fecha_fin: datetime | None
    estado: EstadoProceso
    observaciones: str | None

    @model_validator(mode="after")
    def validar_fechas(self):
        if (
            self.fecha_fin is not None
            and self.fecha_fin < self.fecha_inicio
        ):
            raise ValueError(
                "La fecha final no puede ser anterior al inicio"
            )

        return self