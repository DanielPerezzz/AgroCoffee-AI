from pydantic import EmailStr, Field, field_validator

from app.schemas.common import AgroCoffeeSchema
from app.schemas.usuario import validar_password_seguro


class TokenResponse(AgroCoffeeSchema):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int = Field(gt=0)


class RefreshTokenRequest(AgroCoffeeSchema):
    refresh_token: str = Field(min_length=20)


class LogoutRequest(AgroCoffeeSchema):
    refresh_token: str = Field(min_length=20)


class ChangePasswordRequest(AgroCoffeeSchema):
    current_password: str = Field(
        min_length=8,
        max_length=128,
    )
    new_password: str = Field(
        min_length=8,
        max_length=128,
    )

    @field_validator("new_password")
    @classmethod
    def validar_nueva_password(cls, password: str) -> str:
        return validar_password_seguro(password)


class MessageResponse(AgroCoffeeSchema):
    message: str


class PasswordResetStartRequest(AgroCoffeeSchema):
    correo: EmailStr


class PasswordResetStartResponse(AgroCoffeeSchema):
    message: str
    expires_in: int = Field(gt=0)
    demo_code: str | None = None


class PasswordResetConfirmRequest(AgroCoffeeSchema):
    correo: EmailStr
    codigo: str = Field(pattern=r"^\d{6}$")
    new_password: str = Field(min_length=8, max_length=128)

    @field_validator("new_password")
    @classmethod
    def validar_nueva_password(cls, password: str) -> str:
        return validar_password_seguro(password)
