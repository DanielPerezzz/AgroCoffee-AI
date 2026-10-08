"""agregar recuperacion password

Revision ID: f8a4d6c2b9e1
Revises: e7b1c9a4d2f6
Create Date: 2026-10-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f8a4d6c2b9e1"
down_revision: Union[str, Sequence[str], None] = "e7b1c9a4d2f6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "password_reset_token",
        sa.Column("id_password_reset", sa.Integer(), nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("codigo_hash", sa.String(length=64), nullable=False),
        sa.Column(
            "creado_en",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("expira_en", sa.DateTime(timezone=True), nullable=False),
        sa.Column("usado_en", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "intentos_fallidos",
            sa.Integer(),
            server_default="0",
            nullable=False,
        ),
        sa.ForeignKeyConstraint(
            ["id_usuario"],
            ["usuario.id_usuario"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id_password_reset"),
    )
    op.create_index(
        "ix_password_reset_usuario_usado",
        "password_reset_token",
        ["id_usuario", "usado_en"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(
        "ix_password_reset_usuario_usado",
        table_name="password_reset_token",
    )
    op.drop_table("password_reset_token")
