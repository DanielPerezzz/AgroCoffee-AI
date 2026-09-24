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
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.alerta import Alerta
    from app.models.dispositivo import Dispositivo
    from app.models.prediccion import Prediccion
    from app.models.proceso_secado import ProcesoSecado


class Medicion(Base):
    __tablename__ = "medicion"
    __table_args__ = (
        Index(
            "ix_medicion_proceso_fecha",
            "id_proceso",
            "fecha_hora",
        ),
    )

    id_medicion: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_proceso: Mapped[int] = mapped_column(
        ForeignKey(
            "proceso_secado.id_proceso",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    id_dispositivo: Mapped[int] = mapped_column(
        ForeignKey(
            "dispositivo.id_dispositivo",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )
    fecha_hora: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    temperatura: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 2),
        nullable=True,
    )
    humedad_ambiental: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 2),
        nullable=True,
    )
    humedad_cafe: Mapped[Decimal | None] = mapped_column(
        Numeric(6, 2),
        nullable=True,
    )
    luminosidad: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )
    tiempo_transcurrido_horas: Mapped[Decimal | None] = mapped_column(
        Numeric(10, 2),
        nullable=True,
    )

    proceso: Mapped[ProcesoSecado] = relationship(
        back_populates="mediciones",
        lazy="selectin",
    )
    dispositivo: Mapped[Dispositivo] = relationship(
        back_populates="mediciones",
        lazy="selectin",
    )
    alertas: Mapped[list[Alerta]] = relationship(
        back_populates="medicion",
        lazy="selectin",
    )
    predicciones: Mapped[list[Prediccion]] = relationship(
        back_populates="medicion",
        lazy="selectin",
    )