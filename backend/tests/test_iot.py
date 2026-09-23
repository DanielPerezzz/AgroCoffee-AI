from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.services.iot import validate_iot_context


def entity(**values):
    return SimpleNamespace(**values)


def valid_context():
    dispositivo = entity(id_dispositivo=3, id_usuario=7)
    proceso = entity(estado="EN_PROCESO")
    lote = entity(id_usuario=7)
    return dispositivo, proceso, lote


def test_iot_context_accepts_matching_device_owner_and_process() -> None:
    dispositivo, proceso, lote = valid_context()
    validate_iot_context(dispositivo, proceso, lote, 3)


def test_iot_context_rejects_another_device_id() -> None:
    dispositivo, proceso, lote = valid_context()
    with pytest.raises(HTTPException) as error:
        validate_iot_context(dispositivo, proceso, lote, 8)
    assert error.value.status_code == 403


def test_iot_context_rejects_device_from_another_owner() -> None:
    dispositivo, proceso, lote = valid_context()
    lote.id_usuario = 9
    with pytest.raises(HTTPException) as error:
        validate_iot_context(dispositivo, proceso, lote, 3)
    assert error.value.status_code == 403


@pytest.mark.parametrize("state", ["PAUSADO", "FINALIZADO", "CANCELADO"])
def test_iot_context_rejects_inactive_process(state: str) -> None:
    dispositivo, proceso, lote = valid_context()
    proceso.estado = state
    with pytest.raises(HTTPException) as error:
        validate_iot_context(dispositivo, proceso, lote, 3)
    assert error.value.status_code == 409
