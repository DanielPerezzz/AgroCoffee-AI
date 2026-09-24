from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.dispositivo import Dispositivo
    from app.models.lote_cafe import LoteCafe
    from app.models.refresh_token import RefreshToken


class Usuario(Base):
    __tablename__ = "usuario"

    id_usuario: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    nombre: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    correo: Mapped[str] = mapped_column(
        String(150),
        unique=True,
        nullable=False,
    )

    # Conservamos el nombre "pass" en PostgreSQL para que sea
    # compatible con la base del compañero. En Python se manejará
    # únicamente como hash, nunca como contraseña sin protección.
    password_hash: Mapped[str] = mapped_column(
        "pass",
        String(255),
        nullable=False,
    )
    rol: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="PRODUCTOR",
        server_default="PRODUCTOR",
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

    lotes: Mapped[list[LoteCafe]] = relationship(
        back_populates="usuario",
        lazy="selectin",
    )
    dispositivos: Mapped[list[Dispositivo]] = relationship(
        back_populates="usuario",
        lazy="selectin",
    )

    refresh_tokens: Mapped[list[RefreshToken]] = relationship(
        back_populates="usuario",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )
