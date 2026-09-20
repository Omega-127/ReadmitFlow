"""
ml/evaluate.py

Standalone evaluation script for reproducing, printing, and exporting model metrics.
Usage:
    python ml/evaluate.py
"""

import sys
from pathlib import Path
import joblib

PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.src.data_loading import load_raw_data, build_demo_proxy_target
from ml.src.feature_engineering import normalize_input_features
from ml.src.evaluation import evaluate_model
from ml.src.export import export_metrics_json, BACKEND_MODELS_DIR
from ml.src.preprocessing import ALL_FEATURE_COLUMNS
from sklearn.model_selection import train_test_split


def run_evaluation():
    model_path = BACKEND_MODELS_DIR / "readmission_model.joblib"
    if not model_path.exists():
        print(f"Error: Model artifact not found at {model_path}. Run 'python ml/train.py' first.")
        sys.exit(1)

    print(f"Loading trained model from {model_path}...")
    model = joblib.load(model_path)

    print("Loading raw data and building evaluation split...")
    df_raw = load_raw_data()
    df_prep, _ = build_demo_proxy_target(df_raw)
    df_clean = normalize_input_features(df_prep)

    X = df_clean[ALL_FEATURE_COLUMNS]
    y = df_clean["target"]

    _, X_test, _, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print(f"Evaluating model on {len(X_test)} holdout test samples...")
    metrics = evaluate_model(
        model=model,
        X_test=X_test,
        y_test=y_test,
        model_type_name="LogisticRegression",
        training_samples=len(X) - len(X_test),
    )

    print("\n--- Model Evaluation Results (DEMO-ONLY) ---")
    print(f"Model Type:        {metrics['model_type']}")
    print(f"ROC-AUC:           {metrics['roc_auc']:.4f}")
    print(f"Precision:         {metrics['precision']:.4f}")
    print(f"Recall:            {metrics['recall']:.4f}")
    print(f"F1-Score:          {metrics['f1']:.4f}")
    print(f"Accuracy:          {metrics['accuracy']:.4f}")
    print(f"Confusion Matrix:  {metrics['confusion_matrix']}")
    print(f"Limitations:       {len(metrics['limitations'])} documented limitation items")

    metrics_file = export_metrics_json(metrics)
    print(f"\nMetrics written to {metrics_file}")
    return metrics


if __name__ == "__main__":
    run_evaluation()
