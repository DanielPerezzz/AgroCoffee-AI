from datetime import datetime
from decimal import Decimal

from pydantic import Field, field_validator

from app.schemas.common import AgroCoffeeSchema


class LoteCafeBase(AgroCoffeeSchema):
    codigo_lote: str = Field(
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z0-9_-]+$",
    )
    cantidad_kg: Decimal = Field(
        gt=0,
        max_digits=10,
        decimal_places=2,
    )
    humedad_inicial: Decimal = Field(
        ge=0,
        le=100,
        max_digits=5,
        decimal_places=2,
    )

    @field_validator("codigo_lote")
    @classmethod
    def normalizar_codigo(cls, codigo: str) -> str:
        return codigo.upper()


class LoteCafeCreate(LoteCafeBase):
    pass


class LoteCafeUpdate(AgroCoffeeSchema):
    codigo_lote: str | None = Field(
        default=None,
        min_length=3,
        max_length=50,
        pattern=r"^[A-Za-z0-9_-]+$",
    )
    cantidad_kg: Decimal | None = Field(
        default=None,
        gt=0,
        max_digits=10,
        decimal_places=2,
    )
    humedad_inicial: Decimal | None = Field(
        default=None,
        ge=0,
        le=100,
        max_digits=5,
        decimal_places=2,
    )

    @field_validator("codigo_lote")
    @classmethod
    def normalizar_codigo(
        cls,
        codigo: str | None,
    ) -> str | None:
        if codigo is None:
            return None

        return codigo.upper()


class LoteCafeResponse(LoteCafeBase):
    id_lote: int
    id_usuario: int
    fecha_creacion: datetime