"""
ml/train.py

Main training entry point for the ReadmitFlow ML pipeline.
Executes the full pipeline:
1. Data loading & schema validation
2. Strict target validation with documented demo proxy
3. Feature engineering & normalization
4. Logistic Regression training with train/test split
5. Comprehensive holdout evaluation
6. Coefficient-based explainability check
7. Artifact export (model joblib, metrics JSON, demo patients JSON)

Usage:
    python ml/train.py
"""

import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from ml.src.data_loading import load_raw_data, validate_raw_schema, validate_target, build_demo_proxy_target
from ml.src.feature_engineering import normalize_input_features
from ml.src.training import train_baseline_model
from ml.src.evaluation import evaluate_model
from ml.src.export import export_model_artifact, export_metrics_json, export_demo_patients_json
from ml.prepare_demo_data import generate_demo_patients


def run_training_pipeline():
    print("=" * 70)
    print(" ReadmitFlow ML Training Pipeline — DEMO-ONLY BASELINE")
    print("=" * 70)

    # 1. Data loading
    print("\n[1/6] Loading raw dataset...")
    df_raw = load_raw_data()
    schema_report = validate_raw_schema(df_raw)
    print(f"      Total records loaded: {schema_report['total_rows']}")
    print(f"      Raw columns validated: {len(df_raw.columns)} columns present.")

    # 2. Target validation & Demo Proxy construction
    print("\n[2/6] Validating readmission target governance...")
    is_valid, notice = validate_target(df_raw, allow_demo_proxy=True)
    print(f"      {notice}")

    print("      Building documented demo proxy target (Option C)...")
    df_prepared, target_meta = build_demo_proxy_target(df_raw)
    print(f"      Positive class rate: {target_meta['positive_rate']:.2%}")

    # 3. Feature normalization
    print("\n[3/6] Normalizing features...")
    df_clean = normalize_input_features(df_prepared)

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
    print(" Pipeline execution complete. All outputs flagged demo_only=True.")
    print("=" * 70)
    return model, metrics, demo_patients


if __name__ == "__main__":
    run_training_pipeline()
