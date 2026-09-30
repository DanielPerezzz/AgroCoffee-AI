"""asociar dispositivo a proceso

Revision ID: c4d7e9f2a1b3
Revises: a8f3c2d91e70
Create Date: 2026-09-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4d7e9f2a1b3"
down_revision: Union[str, Sequence[str], None] = "a8f3c2d91e70"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "proceso_secado",
        sa.Column("id_dispositivo", sa.Integer(), nullable=True),
    )
    op.create_foreign_key(
        "fk_proceso_secado_dispositivo",
        "proceso_secado",
        "dispositivo",
        ["id_dispositivo"],
        ["id_dispositivo"],
        ondelete="RESTRICT",
    )
    op.create_index(
        op.f("ix_proceso_secado_id_dispositivo"),
        "proceso_secado",
        ["id_dispositivo"],
        unique=False,
    )

    # Conserva los procesos existentes asociándolos con el primer dispositivo
    # activo perteneciente al propietario del lote, cuando exista.
    op.execute(
        """
        UPDATE proceso_secado AS proceso
        SET id_dispositivo = (
            SELECT dispositivo.id_dispositivo
            FROM lote_cafe AS lote
            JOIN dispositivo
              ON dispositivo.id_usuario = lote.id_usuario
            WHERE lote.id_lote = proceso.id_lote
              AND dispositivo.estado = 'ACTIVO'
            ORDER BY dispositivo.id_dispositivo
            LIMIT 1
        )
        WHERE proceso.id_dispositivo IS NULL
        """
    )


def downgrade() -> None:
    op.drop_index(
        op.f("ix_proceso_secado_id_dispositivo"),
        table_name="proceso_secado",
    )
    op.drop_constraint(
        "fk_proceso_secado_dispositivo",
        "proceso_secado",
        type_="foreignkey",
    )
    op.drop_column("proceso_secado", "id_dispositivo")
