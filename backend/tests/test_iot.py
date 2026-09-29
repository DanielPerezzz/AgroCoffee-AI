from types import SimpleNamespace

import pytest
from fastapi import HTTPException

from app.schemas.iot import IoTMeasurementCreate
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


def test_iot_measurement_only_needs_sensor_values() -> None:
    measurement = IoTMeasurementCreate(
        temperatura="29.00",
        humedad_ambiental="65.00",
        humedad_cafe="19.00",
        luminosidad="72.00",
        tiempo_transcurrido_horas="36.00",
    )
    assert measurement.temperatura == 29
    assert "id_proceso" not in measurement.model_dump()
    assert "id_dispositivo" not in measurement.model_dump()
