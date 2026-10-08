from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.usuario import Usuario


class PasswordResetToken(Base):
    __tablename__ = "password_reset_token"
    __table_args__ = (
        Index(
            "ix_password_reset_usuario_usado",
            "id_usuario",
            "usado_en",
        ),
    )

    id_password_reset: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuario.id_usuario", ondelete="CASCADE"),
        nullable=False,
    )
    codigo_hash: Mapped[str] = mapped_column(
        String(64),
        nullable=False,
    )
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    expira_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    usado_en: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    intentos_fallidos: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )

    usuario: Mapped[Usuario] = relationship(
        back_populates="password_reset_tokens",
        lazy="selectin",
    )
