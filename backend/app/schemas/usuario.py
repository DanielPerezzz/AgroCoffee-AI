from datetime import datetime

from pydantic import EmailStr, Field, field_validator

from app.schemas.common import AgroCoffeeSchema
from app.schemas.enums import EstadoGeneral, RolUsuario


def validar_password_seguro(password: str) -> str:
    if not any(caracter.isupper() for caracter in password):
        raise ValueError(
            "La contraseña debe incluir una letra mayúscula"
        )

    if not any(caracter.islower() for caracter in password):
        raise ValueError(
            "La contraseña debe incluir una letra minúscula"
        )

    if not any(caracter.isdigit() for caracter in password):
        raise ValueError(
            "La contraseña debe incluir un número"
        )

    return password


class UsuarioBase(AgroCoffeeSchema):
    nombre: str = Field(
        min_length=2,
        max_length=150,
    )
    correo: EmailStr
    rol: RolUsuario = RolUsuario.PRODUCTOR


class UsuarioCreate(UsuarioBase):
    password: str = Field(
        min_length=8,
        max_length=128,
    )

    @field_validator("password")
    @classmethod
    def validar_password(cls, password: str) -> str:
        return validar_password_seguro(password)


class UsuarioRegister(AgroCoffeeSchema):
    nombre: str = Field(
        min_length=2,
        max_length=150,
    )
    correo: EmailStr
    password: str = Field(
        min_length=8,
        max_length=128,
    )

    @field_validator("password")
    @classmethod
    def validar_password(cls, password: str) -> str:
        return validar_password_seguro(password)


class UsuarioUpdate(AgroCoffeeSchema):
    nombre: str | None = Field(
        default=None,
        min_length=2,
        max_length=150,
    )
    correo: EmailStr | None = None
    rol: RolUsuario | None = None
    estado: EstadoGeneral | None = None


class UsuarioResponse(UsuarioBase):
    id_usuario: int
    fecha_registro: datetime
    estado: EstadoGeneral