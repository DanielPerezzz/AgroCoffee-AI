import json

import pytest

from app.ml.dataset import classify_sample, estimate_remaining_hours
from app.ml.predictor import recommendation_for_state
from app.ml.train import train_models


@pytest.mark.parametrize(
    ("sample", "expected_state"),
    [
        ((29.0, 65.0, 19.0, 72.0, 36.0), "FAVORABLE"),
        ((22.0, 82.0, 25.0, 20.0, 72.0), "SECADO_LENTO"),
        ((41.0, 94.0, 35.0, 15.0, 110.0), "DESFAVORABLE"),
        ((28.0, 60.0, 11.5, 70.0, 120.0), "COMPLETADO"),
    ],
)
def test_synthetic_labeling_rules(sample, expected_state: str) -> None:
    assert classify_sample(*sample) == expected_state


def test_completed_coffee_has_no_remaining_time() -> None:
    assert estimate_remaining_hours(29.0, 60.0, 11.5, 70.0) == 0.0


def test_high_ambient_humidity_increases_remaining_time() -> None:
    favorable = estimate_remaining_hours(29.0, 55.0, 20.0, 70.0)
    humid = estimate_remaining_hours(29.0, 90.0, 20.0, 70.0)
    assert humid > favorable


def test_training_creates_models_and_metrics(tmp_path) -> None:
    metrics = train_models(tmp_path, sample_count=800)

    assert (tmp_path / "drying_classifier.joblib").exists()
    assert (tmp_path / "remaining_time_regressor.joblib").exists()
    assert (tmp_path / "metrics.json").exists()
    assert metrics["classification"]["accuracy"] >= 0.80
    assert metrics["regression"]["mae_hours"] < 15.0

    stored_metrics = json.loads(
        (tmp_path / "metrics.json").read_text(encoding="utf-8")
    )
    assert stored_metrics["dataset"] == "sintetico_reproducible"


@pytest.mark.parametrize(
    ("state", "alert_level"),
    [
        ("FAVORABLE", None),
        ("SECADO_LENTO", "ADVERTENCIA"),
        ("DESFAVORABLE", "CRITICA"),
        ("COMPLETADO", "INFORMACION"),
    ],
)
def test_recommendations_define_expected_alert_level(
    state: str,
    alert_level: str | None,
) -> None:
    recommendation, level, _ = recommendation_for_state(state)
    assert recommendation
    assert level == alert_level
