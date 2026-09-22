from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.proceso_secado import ProcesoSecado
    from app.models.usuario import Usuario


class LoteCafe(Base):
    __tablename__ = "lote_cafe"

    id_lote: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey(
            "usuario.id_usuario",
            ondelete="RESTRICT",
        ),
        nullable=False,
        index=True,
    )
    codigo_lote: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )
    cantidad_kg: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )
    humedad_inicial: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
    )
    fecha_creacion: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    usuario: Mapped[Usuario] = relationship(
        back_populates="lotes",
        lazy="selectin",
    )
    procesos: Mapped[list[ProcesoSecado]] = relationship(
        back_populates="lote",
        lazy="selectin",
    )