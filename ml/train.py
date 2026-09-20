"""
ml/train.py

Main training entry point for the ReadmitFlow ML pipeline.
Executes the full pipeline:
1. Synthea CSV load & encounter feature build
2. Derived 30-day inpatient readmission label validation
3. Feature engineering & normalization
4. Logistic Regression training with train/test split
5. Comprehensive holdout evaluation
6. Artifact export (model joblib, metrics JSON, demo patients JSON)

Usage:
    python ml/train.py
    python ml/train.py --rebuild-features
"""

import argparse
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.src.synthea_etl import load_synthea_training_frame
from ml.src.data_loading import validate_target
from ml.src.feature_engineering import normalize_input_features
from ml.src.training import train_baseline_model
from ml.src.evaluation import evaluate_model
from ml.src.export import export_model_artifact, export_metrics_json, export_demo_patients_json
from ml.prepare_demo_data import generate_demo_patients


def run_training_pipeline(rebuild_features: bool = False):
    print("=" * 70)
    print(" ReadmitFlow ML Training Pipeline — SYNTHEA DERIVED LABEL")
    print("=" * 70)

    # 1. Synthea load / feature build
    print("\n[1/6] Loading Synthea encounter features...")
    df_raw, source_meta = load_synthea_training_frame(rebuild=rebuild_features)
    print(f"      Source: {source_meta.get('source')}")
    print(f"      Total inpatient encounters: {source_meta.get('total_samples')}")
    print(f"      Positive readmission rate: {source_meta.get('positive_rate', 0):.2%}")
    if source_meta.get("label_definition"):
        print(f"      Label: {source_meta['label_definition']}")

    # 2. Target validation (expect derived readmitted_30d)
    print("\n[2/6] Validating readmission target governance...")
    is_valid, notice = validate_target(df_raw, target_col="readmitted_30d", allow_demo_proxy=False)
    print(f"      {notice}")
    if "target" not in df_raw.columns:
        df_raw = df_raw.copy()
        df_raw["target"] = df_raw["readmitted_30d"].astype(int)

    # 3. Feature normalization
    print("\n[3/6] Normalizing features...")
    df_clean = normalize_input_features(df_raw)

    # 4. Training
    print("\n[4/6] Training primary Logistic Regression baseline (stratified split 80/20)...")
    model, split_data = train_baseline_model(
        X=df_clean,
        y=df_clean["target"],
        test_size=0.2,
        random_state=42,
        compare_tree=True,
    )
    print("      Model fitted successfully with class_weight='balanced'.")

    # 5. Evaluation
    print("\n[5/6] Evaluating holdout test set...")
    metrics = evaluate_model(
        model=model,
        X_test=split_data["X_test"],
        y_test=split_data["y_test"],
        model_type_name="LogisticRegression",
        training_samples=len(split_data["X_train"]),
        data_source_note=(
            "Trained on Synthea COVID-19 10K synthetic EHR sample with a derived "
            "30-day inpatient readmission label (next inpatient within 30 days of discharge)."
        ),
    )
    print(f"      ROC-AUC:   {metrics['roc_auc']}")
    print(f"      Precision: {metrics['precision']}")
    print(f"      Recall:    {metrics['recall']}")
    print(f"      F1-Score:  {metrics['f1']}")
    print(f"      Accuracy:  {metrics['accuracy']}")
    print(f"      Confusion Matrix: {metrics['confusion_matrix']}")

    # 6. Artifact Export
    print("\n[6/6] Exporting artifacts...")
    model_path = export_model_artifact(model)
    print(f"      Model artifact exported:  {model_path}")

    metrics_path = export_metrics_json(metrics)
    print(f"      Metrics JSON exported:    {metrics_path}")

    print("      Generating and scoring demo patients...")
    demo_patients = generate_demo_patients(model_path=model_path, num_patients=50)
    patients_path = export_demo_patients_json(demo_patients)
    print(f"      Demo patients exported:   {patients_path}")

    print("\n" + "=" * 70)
    print(" Pipeline complete. Synthea-derived label; outputs remain demo_only=True.")
    print("=" * 70)
    return model, metrics, demo_patients


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train ReadmitFlow baseline on Synthea data.")
    parser.add_argument(
        "--rebuild-features",
        action="store_true",
        help="Rebuild dataset/synthea/encounter_features.csv from raw Synthea CSVs.",
    )
    args = parser.parse_args()
    run_training_pipeline(rebuild_features=args.rebuild_features)
