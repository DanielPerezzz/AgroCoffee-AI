"""agregar refresh tokens

Revision ID: a8f3c2d91e70
Revises: 17feacbef8bd
Create Date: 2026-09-23

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "a8f3c2d91e70"
down_revision: Union[str, Sequence[str], None] = "17feacbef8bd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "refresh_token",
        sa.Column(
            "id_refresh_token",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "id_usuario",
            sa.Integer(),
            nullable=False,
        ),
        sa.Column(
            "token_hash",
            sa.String(length=64),
            nullable=False,
        ),
        sa.Column(
            "creado_en",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "expira_en",
            sa.DateTime(timezone=True),
            nullable=False,
        ),
        sa.Column(
            "revocado_en",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
        sa.ForeignKeyConstraint(
            ["id_usuario"],
            ["usuario.id_usuario"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id_refresh_token"),
        sa.UniqueConstraint("token_hash"),
    )
    op.create_index(
        "ix_refresh_token_usuario_revocado",
        "refresh_token",
        ["id_usuario", "revocado_en"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_refresh_token_usuario_revocado",
        table_name="refresh_token",
    )
    op.drop_table("refresh_token")
