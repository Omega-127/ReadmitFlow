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

    cm_dict = metrics_payload.get("confusion_matrix", {})
    if isinstance(cm_dict, dict):
        matrix = [
            [int(cm_dict.get("true_negative", 0)), int(cm_dict.get("false_positive", 0))],
            [int(cm_dict.get("false_negative", 0)), int(cm_dict.get("true_positive", 0))],
        ]
    elif isinstance(cm_dict, list):
        matrix = cm_dict
        if len(matrix) == 2 and len(matrix[0]) == 2:
            cm_dict = {
                "true_negative": int(matrix[0][0]),
                "false_positive": int(matrix[0][1]),
                "false_negative": int(matrix[1][0]),
                "true_positive": int(matrix[1][1]),
            }
        else:
            cm_dict = {"true_negative": 0, "false_positive": 0, "false_negative": 0, "true_positive": 0}
    else:
        matrix = [[0, 0], [0, 0]]
        cm_dict = {"true_negative": 0, "false_positive": 0, "false_negative": 0, "true_positive": 0}

    preprocessing = metrics_payload.get("preprocessing_summary", [])
    if isinstance(preprocessing, str):
        preprocessing = [preprocessing]

    roc_auc = float(metrics_payload.get("roc_auc", 0.0))
    precision = float(metrics_payload.get("precision", 0.0))
    recall = float(metrics_payload.get("recall", 0.0))
    f1 = float(metrics_payload.get("f1", 0.0))

    api_payload = {
        "demo_only": True,
        "model_type": metrics_payload.get("model_type", "LogisticRegression"),
        "roc_auc": roc_auc,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "confusion_matrix": cm_dict,
        "metrics": {
            "roc_auc": roc_auc,
            "precision": precision,
            "recall": recall,
            "f1": f1,
            "confusion_matrix": matrix,
        },
        "preprocessing_summary": preprocessing,
        "limitations": metrics_payload.get("limitations", []),
        "notes": metrics_payload.get("notes"),
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
