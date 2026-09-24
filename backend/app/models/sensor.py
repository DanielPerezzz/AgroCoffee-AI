from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.dispositivo import Dispositivo


class Sensor(Base):
    __tablename__ = "sensor"

    id_sensor: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_dispositivo: Mapped[int] = mapped_column(
        ForeignKey(
            "dispositivo.id_dispositivo",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )
    tipo_sensor: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    nombre: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    unidad_medida: Mapped[str | None] = mapped_column(
        String(30),
        nullable=True,
    )
    pin: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )
    estado: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="ACTIVO",
        server_default="ACTIVO",
    )

    dispositivo: Mapped[Dispositivo] = relationship(
        back_populates="sensores",
        lazy="selectin",
    )