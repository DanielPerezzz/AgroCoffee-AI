from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.usuario import Usuario


class RefreshToken(Base):
    __tablename__ = "refresh_token"
    __table_args__ = (
        Index(
            "ix_refresh_token_usuario_revocado",
            "id_usuario",
            "revocado_en",
        ),
    )

    id_refresh_token: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey(
            "usuario.id_usuario",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    token_hash: Mapped[str] = mapped_column(
        String(64),
        unique=True,
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
    revocado_en: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    usuario: Mapped[Usuario] = relationship(
        back_populates="refresh_tokens",
        lazy="selectin",
    )
