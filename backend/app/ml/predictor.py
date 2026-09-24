import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

import joblib
import numpy as np

from app.ml.train import DEFAULT_OUTPUT_DIR, MODEL_VERSION, train_models


@dataclass(frozen=True)
class DryingPrediction:
    state: str
    remaining_hours: float
    confidence_percent: float
    recommendation: str
    alert_level: str | None
    alert_type: str | None


def recommendation_for_state(state: str) -> tuple[str, str | None, str | None]:
    recommendations = {
        "FAVORABLE": (
            "Las condiciones son adecuadas; mantenga el monitoreo del proceso.",
            None,
            None,
        ),
        "SECADO_LENTO": (
            "Revise la ventilación, la humedad ambiental y la exposición a la luz.",
            "ADVERTENCIA",
            "SECADO_LENTO",
        ),
        "DESFAVORABLE": (
            "Ajuste inmediatamente la ventilación o protección del área de secado.",
            "CRITICA",
            "CONDICIONES_DESFAVORABLES",
        ),
        "COMPLETADO": (
            "La humedad objetivo fue alcanzada; verifique y finalice el proceso.",
            "INFORMACION",
            "SECADO_COMPLETADO",
        ),
    }
    return recommendations[state]


def _ensure_artifacts() -> None:
    required_files = (
        DEFAULT_OUTPUT_DIR / "drying_classifier.joblib",
        DEFAULT_OUTPUT_DIR / "remaining_time_regressor.joblib",
        DEFAULT_OUTPUT_DIR / "metrics.json",
    )
    if not all(path.exists() for path in required_files):
        train_models(DEFAULT_OUTPUT_DIR)


@lru_cache(maxsize=1)
def _load_models():
    _ensure_artifacts()
    classifier_data = joblib.load(
        DEFAULT_OUTPUT_DIR / "drying_classifier.joblib"
    )
    regressor_data = joblib.load(
        DEFAULT_OUTPUT_DIR / "remaining_time_regressor.joblib"
    )
    return classifier_data, regressor_data


def predict_drying_state(
    *,
    temperature: float,
    ambient_humidity: float,
    coffee_humidity: float,
    light: float,
    elapsed_hours: float,
) -> DryingPrediction:
    classifier_data, regressor_data = _load_models()
    sample = np.array(
        [[temperature, ambient_humidity, coffee_humidity, light, elapsed_hours]],
        dtype=float,
    )

    classifier = classifier_data["model"]
    regressor = regressor_data["model"]
    state = str(classifier.predict(sample)[0])
    probabilities = classifier.predict_proba(sample)[0]
    confidence = float(np.max(probabilities) * 100.0)
    remaining_hours = max(0.0, float(regressor.predict(sample)[0]))

    if state == "COMPLETADO":
        remaining_hours = 0.0

    recommendation, alert_level, alert_type = recommendation_for_state(state)
    return DryingPrediction(
        state=state,
        remaining_hours=round(remaining_hours, 2),
        confidence_percent=round(confidence, 2),
        recommendation=recommendation,
        alert_level=alert_level,
        alert_type=alert_type,
    )


def get_model_metrics() -> dict:
    _ensure_artifacts()
    return json.loads(
        (DEFAULT_OUTPUT_DIR / "metrics.json").read_text(encoding="utf-8")
    )


def get_model_version() -> str:
    return MODEL_VERSION
