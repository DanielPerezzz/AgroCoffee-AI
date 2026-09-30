from datetime import datetime, timezone
from decimal import Decimal

from app.services.ai_chat import ChatSnapshot, answer_chat, detect_intent


def build_snapshot(**changes) -> ChatSnapshot:
    values = {
        "process_id": 1,
        "process_status": "EN_PROCESO",
        "measurement_id": 88,
        "measurement_date": datetime.now(timezone.utc),
        "temperature": Decimal("29.90"),
        "ambient_humidity": Decimal("65.00"),
        "coffee_humidity": Decimal("18.49"),
        "light": Decimal("60.27"),
        "elapsed_hours": Decimal("41.01"),
        "drying_status": "FAVORABLE",
        "remaining_hours": Decimal("31.19"),
        "confidence": Decimal("97.71"),
        "recommendation": "Mantenga el monitoreo del proceso.",
        "model_version": "random-forest-synthetic-v1",
        "pending_alerts": 0,
        "coffee_humidity_change": Decimal("-1.20"),
    }
    values.update(changes)
    return ChatSnapshot(**values)


def test_detects_relevant_intents() -> None:
    assert detect_intent("¿Por qué el secado está favorable?") == "EXPLICACION"
    assert detect_intent("¿Cuánto tiempo falta?") == "TIEMPO_RESTANTE"
    assert detect_intent("¿Cómo cambió la humedad?") == "TENDENCIA"


def test_state_answer_is_grounded_in_snapshot() -> None:
    answer = answer_chat("¿Cómo está mi secado?", build_snapshot())

    assert answer.intent == "ESTADO"
    assert "FAVORABLE" in answer.text
    assert "97.71%" in answer.text
    assert "#88" in answer.text


def test_trend_uses_recent_measurements() -> None:
    answer = answer_chat("¿Cuál es la tendencia?", build_snapshot())

    assert answer.intent == "TENDENCIA"
    assert "disminuyó 1.2 puntos porcentuales" in answer.text


def test_process_without_measurements_is_explained() -> None:
    answer = answer_chat(
        "¿Cómo está mi secado?",
        build_snapshot(measurement_id=None),
    )

    assert "aún no tiene mediciones IoT" in answer.text
