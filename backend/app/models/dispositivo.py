from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Integer,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.medicion import Medicion
    from app.models.sensor import Sensor
    from app.models.usuario import Usuario


class Dispositivo(Base):
    __tablename__ = "dispositivo"

    id_dispositivo: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_usuario: Mapped[int | None] = mapped_column(
        ForeignKey(
            "usuario.id_usuario",
            ondelete="RESTRICT",
        ),
        nullable=True,
        index=True,
    )
    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    codigo: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )
    tipo: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    ubicacion: Mapped[str | None] = mapped_column(
        String(150),
        nullable=True,
    )
    api_key_hash: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )
    fecha_registro: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVO",
        server_default="ACTIVO",
    )

    usuario: Mapped[Usuario | None] = relationship(
        back_populates="dispositivos",
        lazy="selectin",
    )
    sensores: Mapped[list[Sensor]] = relationship(
        back_populates="dispositivo",
        lazy="selectin",
    )
    mediciones: Mapped[list[Medicion]] = relationship(
        back_populates="dispositivo",
        lazy="selectin",
    )