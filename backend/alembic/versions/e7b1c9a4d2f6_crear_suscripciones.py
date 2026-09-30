"""crear suscripciones

Revision ID: e7b1c9a4d2f6
Revises: c4d7e9f2a1b3
Create Date: 2026-09-30

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e7b1c9a4d2f6"
down_revision: Union[str, Sequence[str], None] = "c4d7e9f2a1b3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "plan_suscripcion",
        sa.Column("id_plan", sa.Integer(), nullable=False),
        sa.Column("codigo", sa.String(length=40), nullable=False),
        sa.Column("nombre", sa.String(length=80), nullable=False),
        sa.Column("descripcion", sa.Text(), nullable=False),
        sa.Column("precio_mensual", sa.Numeric(8, 2), nullable=False),
        sa.Column(
            "costo_instalacion",
            sa.Numeric(8, 2),
            server_default="69.99",
            nullable=False,
        ),
        sa.Column("limite_dispositivos", sa.Integer(), nullable=False),
        sa.Column("limite_procesos_activos", sa.Integer(), nullable=False),
        sa.Column("caracteristicas", sa.JSON(), nullable=False),
        sa.Column(
            "activo",
            sa.Boolean(),
            server_default=sa.true(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id_plan"),
        sa.UniqueConstraint("codigo"),
    )
    op.create_table(
        "suscripcion",
        sa.Column("id_suscripcion", sa.Integer(), nullable=False),
        sa.Column("id_usuario", sa.Integer(), nullable=False),
        sa.Column("id_plan", sa.Integer(), nullable=False),
        sa.Column(
            "estado",
            sa.String(length=40),
            server_default="SOLICITADA",
            nullable=False,
        ),
        sa.Column("codigo_contrato", sa.String(length=60), nullable=True),
        sa.Column(
            "fecha_solicitud",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "fecha_actualizacion",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("fecha_inicio", sa.DateTime(timezone=True), nullable=True),
        sa.Column("fecha_fin", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(
            ["id_plan"],
            ["plan_suscripcion.id_plan"],
            ondelete="RESTRICT",
        ),
        sa.ForeignKeyConstraint(
            ["id_usuario"],
            ["usuario.id_usuario"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id_suscripcion"),
        sa.UniqueConstraint("codigo_contrato"),
    )
    op.create_index(
        op.f("ix_suscripcion_id_plan"),
        "suscripcion",
        ["id_plan"],
        unique=False,
    )
    op.create_index(
        op.f("ix_suscripcion_id_usuario"),
        "suscripcion",
        ["id_usuario"],
        unique=False,
    )
    op.create_index(
        "ix_suscripcion_usuario_fecha",
        "suscripcion",
        ["id_usuario", "fecha_solicitud"],
        unique=False,
    )

    plan_table = sa.table(
        "plan_suscripcion",
        sa.column("id_plan", sa.Integer()),
        sa.column("codigo", sa.String()),
        sa.column("nombre", sa.String()),
        sa.column("descripcion", sa.Text()),
        sa.column("precio_mensual", sa.Numeric()),
        sa.column("costo_instalacion", sa.Numeric()),
        sa.column("limite_dispositivos", sa.Integer()),
        sa.column("limite_procesos_activos", sa.Integer()),
        sa.column("caracteristicas", sa.JSON()),
        sa.column("activo", sa.Boolean()),
    )
    op.bulk_insert(
        plan_table,
        [
            {
                "id_plan": 1,
                "codigo": "PRODUCTOR",
                "nombre": "Productor",
                "descripcion": "Monitoreo esencial para una unidad de secado.",
                "precio_mensual": 7.99,
                "costo_instalacion": 69.99,
                "limite_dispositivos": 1,
                "limite_procesos_activos": 1,
                "caracteristicas": [
                    "1 dispositivo IoT",
                    "1 proceso de secado activo",
                    "Predicciones y alertas de IA",
                    "Historial del proceso",
                ],
                "activo": True,
            },
            {
                "id_plan": 2,
                "codigo": "PROFESIONAL",
                "nombre": "Profesional",
                "descripcion": "Para microempresas con varios puntos de monitoreo.",
                "precio_mensual": 14.99,
                "costo_instalacion": 69.99,
                "limite_dispositivos": 3,
                "limite_procesos_activos": 3,
                "caracteristicas": [
                    "Hasta 3 dispositivos IoT",
                    "3 procesos simultáneos",
                    "Predicciones y alertas de IA",
                    "Historial ampliado",
                    "Soporte remoto",
                ],
                "activo": True,
            },
            {
                "id_plan": 3,
                "codigo": "EMPRESA",
                "nombre": "Empresa / Cooperativa",
                "descripcion": "Supervisión centralizada para operaciones de mayor escala.",
                "precio_mensual": 39.99,
                "costo_instalacion": 69.99,
                "limite_dispositivos": 10,
                "limite_procesos_activos": 10,
                "caracteristicas": [
                    "Hasta 10 dispositivos IoT",
                    "10 procesos simultáneos",
                    "Monitoreo centralizado",
                    "Predicciones y alertas de IA",
                    "Soporte prioritario",
                ],
                "activo": True,
            },
        ],
    )
    op.execute(
        """
        SELECT setval(
            pg_get_serial_sequence('plan_suscripcion', 'id_plan'),
            (SELECT MAX(id_plan) FROM plan_suscripcion)
        )
        """
    )
    op.execute(
        """
        INSERT INTO suscripcion (
            id_usuario,
            id_plan,
            estado,
            codigo_contrato,
            fecha_solicitud,
            fecha_actualizacion,
            fecha_inicio,
            fecha_fin
        )
        SELECT
            usuario.id_usuario,
            1,
            'ACTIVA',
            'DEMO-' || usuario.id_usuario,
            NOW(),
            NOW(),
            NOW(),
            NOW() + INTERVAL '30 days'
        FROM usuario
        """
    )


def downgrade() -> None:
    op.drop_index(
        "ix_suscripcion_usuario_fecha",
        table_name="suscripcion",
    )
    op.drop_index(
        op.f("ix_suscripcion_id_usuario"),
        table_name="suscripcion",
    )
    op.drop_index(
        op.f("ix_suscripcion_id_plan"),
        table_name="suscripcion",
    )
    op.drop_table("suscripcion")
    op.drop_table("plan_suscripcion")
