from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    false,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.medicion import Medicion
    from app.models.proceso_secado import ProcesoSecado


class Alerta(Base):
    __tablename__ = "alerta"
    __table_args__ = (
        Index(
            "ix_alerta_proceso_fecha",
            "id_proceso",
            "fecha_hora",
        ),
    )

    id_alerta: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_proceso: Mapped[int] = mapped_column(
        ForeignKey(
            "proceso_secado.id_proceso",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    id_medicion: Mapped[int | None] = mapped_column(
        ForeignKey(
            "medicion.id_medicion",
            ondelete="SET NULL",
        ),
        nullable=True,
    )
    tipo_alerta: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    nivel: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )
    mensaje: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    fecha_hora: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    atendida: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
    )
    fecha_atencion: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    proceso: Mapped[ProcesoSecado] = relationship(
        back_populates="alertas",
        lazy="selectin",
    )
    medicion: Mapped[Medicion | None] = relationship(
        back_populates="alertas",
        lazy="selectin",
    )