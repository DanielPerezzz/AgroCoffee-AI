import argparse
import json
from collections import Counter
from pathlib import Path

import joblib
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

from app.ml.dataset import FEATURE_NAMES, generate_synthetic_dataset


MODEL_VERSION = "random-forest-synthetic-v1"
DEFAULT_OUTPUT_DIR = Path(__file__).resolve().parent / "artifacts"


def train_models(
    output_dir: Path = DEFAULT_OUTPUT_DIR,
    sample_count: int = 6000,
) -> dict:
    dataset = generate_synthetic_dataset(sample_count=sample_count)
    indices = list(range(sample_count))
    train_indices, test_indices = train_test_split(
        indices,
        test_size=0.2,
        random_state=42,
        stratify=dataset.states,
    )

    classifier = RandomForestClassifier(
        n_estimators=140,
        max_depth=14,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=1,
    )
    regressor = RandomForestRegressor(
        n_estimators=140,
        max_depth=16,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=1,
    )

    classifier.fit(dataset.features[train_indices], dataset.states[train_indices])
    regressor.fit(
        dataset.features[train_indices],
        dataset.remaining_hours[train_indices],
    )

    predicted_states = classifier.predict(dataset.features[test_indices])
    predicted_hours = regressor.predict(dataset.features[test_indices])

    metrics = {
        "model_version": MODEL_VERSION,
        "dataset": "sintetico_reproducible",
        "sample_count": sample_count,
        "random_state": 42,
        "features": FEATURE_NAMES,
        "class_distribution": dict(Counter(dataset.states.tolist())),
        "classification": {
            "accuracy": round(
                float(accuracy_score(dataset.states[test_indices], predicted_states)),
                4,
            ),
            "f1_macro": round(
                float(
                    f1_score(
                        dataset.states[test_indices],
                        predicted_states,
                        average="macro",
                    )
                ),
                4,
            ),
        },
        "regression": {
            "mae_hours": round(
                float(
                    mean_absolute_error(
                        dataset.remaining_hours[test_indices],
                        predicted_hours,
                    )
                ),
                4,
            ),
            "r2": round(
                float(
                    r2_score(
                        dataset.remaining_hours[test_indices],
                        predicted_hours,
                    )
                ),
                4,
            ),
        },
    }

    output_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "model": classifier,
            "features": FEATURE_NAMES,
            "version": MODEL_VERSION,
        },
        output_dir / "drying_classifier.joblib",
    )
    joblib.dump(
        {
            "model": regressor,
            "features": FEATURE_NAMES,
            "version": MODEL_VERSION,
        },
        output_dir / "remaining_time_regressor.joblib",
    )
    (output_dir / "metrics.json").write_text(
        json.dumps(metrics, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    return metrics


def main() -> None:
    parser = argparse.ArgumentParser(description="Entrenar modelos de AgroCoffee AI")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
    )
    parser.add_argument("--sample-count", type=int, default=6000)
    args = parser.parse_args()
    metrics = train_models(args.output_dir, args.sample_count)
    print(json.dumps(metrics, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
