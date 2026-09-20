"""
ml/src/export.py

Exports trained model artifacts, evaluation metrics, and scored demo patient data.
Ensures paths are repository-relative and target directories exist before writing.
"""

import json
from pathlib import Path
from typing import Dict, List, Optional
import joblib
from sklearn.pipeline import Pipeline


PROJECT_ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = PROJECT_ROOT / "backend"
BACKEND_MODELS_DIR = BACKEND_DIR / "models"
BACKEND_DATA_DIR = BACKEND_DIR / "data"
ML_PROCESSED_DIR = PROJECT_ROOT / "ml" / "data" / "processed"


def export_model_artifact(
    model: Pipeline,
    target_path: Optional[Path] = None,
) -> Path:
    """
    Serializes the fitted pipeline (preprocessor + classifier) via joblib.
    Defaults to backend/models/readmission_model.joblib.
    """
    path = Path(target_path) if target_path else BACKEND_MODELS_DIR / "readmission_model.joblib"
    path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, path)
    return path


def export_metrics_json(
    metrics_payload: Dict[str, any],
    target_path: Optional[Path] = None,
) -> Path:
    """
    Saves evaluation metrics and documentation notes to JSON.
    Defaults to backend/data/metrics.json in the API response shape.
    """
    path = Path(target_path) if target_path else BACKEND_DATA_DIR / "metrics.json"
    path.parent.mkdir(parents=True, exist_ok=True)

    # Accept either flat training metrics or already-nested API payloads
    if "metrics" in metrics_payload and isinstance(metrics_payload["metrics"], dict):
        api_payload = metrics_payload
    else:
        cm = metrics_payload.get("confusion_matrix", {})
        if isinstance(cm, dict):
            # sklearn layout: [[TN, FP], [FN, TP]]
            matrix = [
                [int(cm.get("true_negative", 0)), int(cm.get("false_positive", 0))],
                [int(cm.get("false_negative", 0)), int(cm.get("true_positive", 0))],
            ]
        else:
            matrix = cm if isinstance(cm, list) else [[0, 0], [0, 0]]

        preprocessing = metrics_payload.get("preprocessing_summary", [])
        if isinstance(preprocessing, str):
            preprocessing = [preprocessing]

        api_payload = {
            "demo_only": True,
            "metrics": {
                "roc_auc": float(metrics_payload.get("roc_auc", 0.0)),
                "precision": float(metrics_payload.get("precision", 0.0)),
                "recall": float(metrics_payload.get("recall", 0.0)),
                "f1": float(metrics_payload.get("f1", 0.0)),
                "confusion_matrix": matrix,
            },
            "preprocessing_summary": preprocessing,
            "limitations": metrics_payload.get("limitations", []),
            "notes": metrics_payload.get("notes"),
            "model_type": metrics_payload.get("model_type"),
            "training_samples": metrics_payload.get("training_samples"),
            "test_samples": metrics_payload.get("test_samples"),
        }

    with open(path, "w", encoding="utf-8") as f:
        json.dump(api_payload, f, indent=2)
    return path


def export_demo_patients_json(
    patients_payload: List[Dict[str, any]],
    target_path: Optional[Path] = None,
) -> Path:
    """
    Saves scored demo patients to JSON.
    Defaults to backend/data/demo_patients.json.
    """
    path = Path(target_path) if target_path else BACKEND_DATA_DIR / "demo_patients.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(patients_payload, f, indent=2)
    return path
