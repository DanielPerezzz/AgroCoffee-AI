from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.alerta import Alerta
    from app.models.lote_cafe import LoteCafe
    from app.models.medicion import Medicion


class ProcesoSecado(Base):
    __tablename__ = "proceso_secado"
    __table_args__ = (
        Index(
            "ix_proceso_secado_lote_estado",
            "id_lote",
            "estado",
        ),
    )

    id_proceso: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_lote: Mapped[int] = mapped_column(
        ForeignKey(
            "lote_cafe.id_lote",
            ondelete="RESTRICT",
        ),
        nullable=False,
    )
    fecha_inicio: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    fecha_fin: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    estado: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="EN_PROCESO",
        server_default="EN_PROCESO",
    )
    observaciones: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    lote: Mapped[LoteCafe] = relationship(
        back_populates="procesos",
        lazy="selectin",
    )
    mediciones: Mapped[list[Medicion]] = relationship(
        back_populates="proceso",
        lazy="selectin",
    )
    alertas: Mapped[list[Alerta]] = relationship(
        back_populates="proceso",
        lazy="selectin",
    )