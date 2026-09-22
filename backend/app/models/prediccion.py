from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.medicion import Medicion


class Prediccion(Base):
    __tablename__ = "prediccion"
    __table_args__ = (
        Index(
            "ix_prediccion_medicion_fecha",
            "id_medicion",
            "fecha",
        ),
    )

    id_prediccion: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_medicion: Mapped[int] = mapped_column(
        ForeignKey(
            "medicion.id_medicion",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    estado_secado: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    tiempo_restante_horas: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    nivel_confianza: Mapped[Decimal | None] = mapped_column(
        Numeric(5, 2),
        nullable=True,
    )
    recomendacion: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    modelo_version: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    fecha: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    medicion: Mapped[Medicion] = relationship(
        back_populates="predicciones",
        lazy="selectin",
    )