from dataclasses import dataclass

import numpy as np


FEATURE_NAMES = [
    "temperatura",
    "humedad_ambiental",
    "humedad_cafe",
    "luminosidad",
    "tiempo_transcurrido_horas",
]


@dataclass(frozen=True)
class SyntheticDataset:
    features: np.ndarray
    states: np.ndarray
    remaining_hours: np.ndarray


def classify_sample(
    temperature: float,
    ambient_humidity: float,
    coffee_humidity: float,
    light: float,
    elapsed_hours: float,
) -> str:
    if coffee_humidity <= 12.5:
        return "COMPLETADO"

    if (
        temperature < 17.0
        or temperature > 39.0
        or ambient_humidity > 90.0
        or (elapsed_hours >= 96.0 and coffee_humidity > 30.0)
    ):
        return "DESFAVORABLE"

    if (
        temperature < 23.0
        or temperature > 35.0
        or ambient_humidity > 76.0
        or light < 30.0
        or (elapsed_hours >= 72.0 and coffee_humidity > 22.0)
    ):
        return "SECADO_LENTO"

    return "FAVORABLE"


def estimate_remaining_hours(
    temperature: float,
    ambient_humidity: float,
    coffee_humidity: float,
    light: float,
) -> float:
    if coffee_humidity <= 12.5:
        return 0.0

    drying_factor = 4.2
    drying_factor += max(0.0, ambient_humidity - 60.0) * 0.055
    drying_factor += max(0.0, 25.0 - temperature) * 0.12
    drying_factor += max(0.0, temperature - 35.0) * 0.08
    drying_factor += max(0.0, 40.0 - light) * 0.025

    return float(min(240.0, max(0.0, (coffee_humidity - 11.5) * drying_factor)))


def generate_synthetic_dataset(
    sample_count: int = 6000,
    random_state: int = 42,
) -> SyntheticDataset:
    rng = np.random.default_rng(random_state)

    temperature = rng.uniform(14.0, 44.0, sample_count)
    ambient_humidity = rng.uniform(30.0, 98.0, sample_count)
    coffee_humidity = rng.uniform(9.0, 55.0, sample_count)
    light = rng.uniform(0.0, 100.0, sample_count)
    elapsed_hours = rng.uniform(0.0, 240.0, sample_count)

    features = np.column_stack(
        (
            temperature,
            ambient_humidity,
            coffee_humidity,
            light,
            elapsed_hours,
        )
    )

    states = np.array(
        [
            classify_sample(*sample)
            for sample in features
        ]
    )

    base_remaining = np.array(
        [
            estimate_remaining_hours(sample[0], sample[1], sample[2], sample[3])
            for sample in features
        ]
    )
    noise = rng.normal(0.0, 2.0, sample_count)
    remaining_hours = np.where(
        coffee_humidity <= 12.5,
        0.0,
        np.clip(base_remaining + noise, 0.0, 240.0),
    )

    return SyntheticDataset(features, states, remaining_hours)
