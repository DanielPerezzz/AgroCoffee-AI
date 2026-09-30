from __future__ import annotations

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Integer, JSON, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.suscripcion import Suscripcion


class PlanSuscripcion(Base):
    __tablename__ = "plan_suscripcion"

    id_plan: Mapped[int] = mapped_column(Integer, primary_key=True)
    codigo: Mapped[str] = mapped_column(
        String(40),
        unique=True,
        nullable=False,
    )
    nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    precio_mensual: Mapped[Decimal] = mapped_column(
        Numeric(8, 2),
        nullable=False,
    )
    costo_instalacion: Mapped[Decimal] = mapped_column(
        Numeric(8, 2),
        nullable=False,
        default=69.99,
        server_default="69.99",
    )
    limite_dispositivos: Mapped[int] = mapped_column(Integer, nullable=False)
    limite_procesos_activos: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    caracteristicas: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    activo: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        server_default="true",
    )

    suscripciones: Mapped[list[Suscripcion]] = relationship(
        back_populates="plan",
        lazy="selectin",
    )
