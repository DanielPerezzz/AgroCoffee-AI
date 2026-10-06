from datetime import datetime
from decimal import Decimal

from pydantic import EmailStr, Field

from app.schemas.common import AgroCoffeeSchema
from app.schemas.enums import EstadoSuscripcion


class PlanSuscripcionResponse(AgroCoffeeSchema):
    id_plan: int
    codigo: str
    nombre: str
    descripcion: str
    precio_mensual: Decimal
    costo_instalacion: Decimal
    limite_dispositivos: int
    limite_procesos_activos: int
    caracteristicas: list[str]
    activo: bool


class SuscripcionCreate(AgroCoffeeSchema):
    id_plan: int = Field(gt=0)


class SuscripcionEstadoUpdate(AgroCoffeeSchema):
    estado: EstadoSuscripcion


class SuscripcionResponse(AgroCoffeeSchema):
    id_suscripcion: int
    id_usuario: int
    id_plan: int
    estado: EstadoSuscripcion
    codigo_contrato: str | None
    fecha_solicitud: datetime
    fecha_actualizacion: datetime
    fecha_inicio: datetime | None
    fecha_fin: datetime | None
    progreso_porcentaje: int
    plan: PlanSuscripcionResponse


class SuscripcionUsuarioResponse(AgroCoffeeSchema):
    id_usuario: int
    nombre: str
    correo: EmailStr


class SuscripcionAdminResponse(SuscripcionResponse):
    usuario: SuscripcionUsuarioResponse
