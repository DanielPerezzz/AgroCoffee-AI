from datetime import datetime

from pydantic import Field, field_validator

from app.schemas.common import AgroCoffeeSchema
from app.schemas.enums import EstadoGeneral


class DispositivoBase(AgroCoffeeSchema):
    nombre: str = Field(
        min_length=2,
        max_length=100,
    )
    codigo: str = Field(
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z0-9_-]+$",
    )
    tipo: str = Field(
        min_length=2,
        max_length=50,
    )
    ubicacion: str | None = Field(
        default=None,
        max_length=150,
    )

    @field_validator("codigo")
    @classmethod
    def normalizar_codigo(cls, codigo: str) -> str:
        return codigo.upper()


class DispositivoCreate(DispositivoBase):
    pass


class DispositivoUpdate(AgroCoffeeSchema):
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    codigo: str | None = Field(
        default=None,
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z0-9_-]+$",
    )
    tipo: str | None = Field(
        default=None,
        min_length=2,
        max_length=50,
    )
    ubicacion: str | None = Field(
        default=None,
        max_length=150,
    )
    estado: EstadoGeneral | None = None

    @field_validator("codigo")
    @classmethod
    def normalizar_codigo(
        cls,
        codigo: str | None,
    ) -> str | None:
        if codigo is None:
            return None

        return codigo.upper()


class DispositivoResponse(DispositivoBase):
    id_dispositivo: int
    id_usuario: int | None
    fecha_registro: datetime
    estado: EstadoGeneral


class DispositivoRegistroResponse(AgroCoffeeSchema):
    dispositivo: DispositivoResponse
    api_key: str