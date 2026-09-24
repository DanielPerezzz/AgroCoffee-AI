from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.api.access import ensure_owner_or_admin
from app.routes.dispositivos import create_device_key
from app.schemas.lote_cafe import LoteCafeCreate
from app.schemas.proceso_secado import ProcesoSecadoCreate


def user(user_id: int, role: str):
    return SimpleNamespace(id_usuario=user_id, rol=role)


def test_owner_can_access_own_resource() -> None:
    ensure_owner_or_admin(7, user(7, "PRODUCTOR"))


def test_administrator_can_access_another_users_resource() -> None:
    ensure_owner_or_admin(7, user(1, "ADMINISTRADOR"))


def test_other_user_is_rejected() -> None:
    with pytest.raises(HTTPException) as error:
        ensure_owner_or_admin(7, user(8, "PRODUCTOR"))
    assert error.value.status_code == 403


def test_device_keys_are_random() -> None:
    first_key = create_device_key()
    second_key = create_device_key()
    assert len(first_key) >= 32
    assert first_key != second_key


def test_batch_code_is_normalized() -> None:
    batch = LoteCafeCreate(
        codigo_lote="cafe-001",
        cantidad_kg="25.50",
        humedad_inicial="42.00",
    )
    assert batch.codigo_lote == "CAFE-001"


def test_process_requires_positive_batch_id() -> None:
    with pytest.raises(ValueError):
        ProcesoSecadoCreate(id_lote=0)
