from datetime import datetime

from pydantic import Field

from app.schemas.common import AgroCoffeeSchema


class IAChatRequest(AgroCoffeeSchema):
    mensaje: str = Field(min_length=2, max_length=500)
    id_proceso: int | None = Field(default=None, gt=0)


class IAChatContext(AgroCoffeeSchema):
    id_proceso: int
    id_medicion: int | None = None
    fecha_medicion: datetime | None = None
    modelo_version: str | None = None


class IAChatResponse(AgroCoffeeSchema):
    respuesta: str
    intencion: str
    sugerencias: list[str]
    contexto: IAChatContext
