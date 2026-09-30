from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.plan_suscripcion import PlanSuscripcion
    from app.models.usuario import Usuario


SUBSCRIPTION_PROGRESS = {
    "SOLICITADA": 15,
    "EN_REVISION": 35,
    "APROBADA": 60,
    "INSTALACION_PROGRAMADA": 80,
    "ACTIVA": 100,
    "VENCIDA": 100,
    "CANCELADA": 0,
    "RECHAZADA": 35,
}


class Suscripcion(Base):
    __tablename__ = "suscripcion"
    __table_args__ = (
        Index(
            "ix_suscripcion_usuario_fecha",
            "id_usuario",
            "fecha_solicitud",
        ),
    )

    id_suscripcion: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    id_plan: Mapped[int] = mapped_column(
        ForeignKey("plan_suscripcion.id_plan", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    estado: Mapped[str] = mapped_column(
        String(40),
        nullable=False,
        default="SOLICITADA",
        server_default="SOLICITADA",
    )
    codigo_contrato: Mapped[str | None] = mapped_column(
        String(60),
        unique=True,
        nullable=True,
    )
    fecha_solicitud: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    fecha_actualizacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    fecha_inicio: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    fecha_fin: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    usuario: Mapped[Usuario] = relationship(
        back_populates="suscripciones",
        lazy="selectin",
    )
    plan: Mapped[PlanSuscripcion] = relationship(
        back_populates="suscripciones",
        lazy="selectin",
    )

    @property
    def progreso_porcentaje(self) -> int:
        return SUBSCRIPTION_PROGRESS.get(self.estado, 0)
