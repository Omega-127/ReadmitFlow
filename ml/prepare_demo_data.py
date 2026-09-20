"""
ml/prepare_demo_data.py

Generates scored, synthetic demo patient records using the trained model artifact.
Prefers sampling real Synthea-derived encounter features when available so the
Command Center shows a realistic HIGH / MEDIUM / LOW mix.
"""

from pathlib import Path
from typing import Dict, List, Optional

import joblib
import numpy as np
import pandas as pd

from ml.src.export import BACKEND_MODELS_DIR, export_demo_patients_json
from ml.src.explainability import compute_patient_risk_drivers
from ml.src.preprocessing import ALL_FEATURE_COLUMNS
from ml.src.synthea_etl import DEFAULT_FEATURES_PATH

ACTION_TEMPLATE_OPTIONS = {
    "high": [
        "Schedule 48h care-coordinator follow-up call",
        "Arrange home health visit & medication review",
        "Specialist urgent consult request",
    ],
    "medium": [
        "Schedule 7-day clinic follow-up visit",
        "Medication reconciliation review",
        "Dietary and disease-management consultation",
    ],
    "low": [
        "Send electronic discharge summary to patient portal",
        "Provide routine educational follow-up pamphlet",
        "Confirm scheduled outpatient follow-up in 30 days",
    ],
}


def _tier_for_score(score: float) -> str:
    if score >= 0.70:
        return "high"
    if score >= 0.40:
        return "medium"
    return "low"


def _fallback_feature_rows(rng: np.random.Generator, n: int) -> pd.DataFrame:
    diagnoses = [
        "Heart Failure",
        "COPD",
        "Diabetes",
        "Hypertension",
        "COVID-19",
        "Cancer",
        "Pneumonia",
        "Other",
    ]
    insurances = ["Medicare", "Medicaid", "Blue Cross", "Dual Eligible", "UnitedHealthcare", "NO_INSURANCE"]
    rows = []
    for _ in range(n):
        rows.append(
            {
                "age": int(rng.integers(22, 88)),
                "gender": str(rng.choice(["M", "F"])),
                "admission_count": int(
                    rng.choice([0, 1, 2, 3, 4, 5, 6], p=[0.30, 0.22, 0.18, 0.12, 0.08, 0.06, 0.04])
                ),
                "days_since_last_admission": int(rng.integers(1, 180)),
                "primary_diagnosis": str(rng.choice(diagnoses)),
                "insurance": str(rng.choice(insurances)),
                "has_pcp": bool(rng.choice([True, False], p=[0.75, 0.25])),
            }
        )
    return pd.DataFrame(rows)


def _load_candidate_features(rng: np.random.Generator, pool_size: int = 2000) -> pd.DataFrame:
    if DEFAULT_FEATURES_PATH.exists():
        df = pd.read_csv(DEFAULT_FEATURES_PATH)
        missing = [c for c in ALL_FEATURE_COLUMNS if c not in df.columns]
        if missing:
            raise ValueError(f"Synthea feature table missing columns: {missing}")
        sample_n = min(pool_size, len(df))
        return df.sample(n=sample_n, random_state=int(rng.integers(0, 1_000_000))).reset_index(drop=True)
    return _fallback_feature_rows(rng, pool_size)


def _select_balanced_rows(
    scored: pd.DataFrame,
    num_patients: int,
    rng: np.random.Generator,
) -> pd.DataFrame:
    """Pick a queue with representation across high / medium / low predicted risk."""
    high_n = max(8, num_patients // 5)
    medium_n = max(12, num_patients // 3)
    low_n = max(1, num_patients - high_n - medium_n)
    targets = {"high": high_n, "medium": medium_n, "low": low_n}

    chosen_idx: List[int] = []
    for tier, count in targets.items():
        bucket_idx = scored.index[scored["risk_tier"] == tier].tolist()
        if not bucket_idx:
            continue
        take = min(count, len(bucket_idx))
        picks = rng.choice(bucket_idx, size=take, replace=False).tolist()
        chosen_idx.extend(int(i) for i in picks)

    if len(chosen_idx) < num_patients:
        remaining = [i for i in scored.index.tolist() if i not in set(chosen_idx)]
        need = num_patients - len(chosen_idx)
        if remaining:
            extra = rng.choice(remaining, size=min(need, len(remaining)), replace=False).tolist()
            chosen_idx.extend(int(i) for i in extra)

    chosen_idx = chosen_idx[:num_patients]
    return scored.loc[chosen_idx].reset_index(drop=True)


def generate_demo_patients(
    model_path: Optional[Path] = None,
    num_patients: int = 50,
    random_state: int = 42,
) -> List[Dict[str, any]]:
    """Generate de-identified demo patients scored by the trained model."""
    path = Path(model_path) if model_path else BACKEND_MODELS_DIR / "readmission_model.joblib"
    if not path.exists():
        raise FileNotFoundError(f"Trained model artifact not found at {path}. Run train.py first.")

    model = joblib.load(path)
    rng = np.random.default_rng(random_state)

    candidates = _load_candidate_features(rng)
    feature_frame = candidates[ALL_FEATURE_COLUMNS].copy()
    probs = model.predict_proba(feature_frame)[:, 1]
    scored = feature_frame.copy()
    scored["risk_score"] = probs
    scored["risk_tier"] = scored["risk_score"].map(_tier_for_score)

    selected = _select_balanced_rows(scored, num_patients=num_patients, rng=rng)

    patient_records: List[Dict[str, any]] = []
    for i, row in selected.iterrows():
        p_data = {col: row[col] for col in ALL_FEATURE_COLUMNS}
        p_data["age"] = int(p_data["age"])
        p_data["admission_count"] = int(p_data["admission_count"])
        p_data["days_since_last_admission"] = int(p_data["days_since_last_admission"])
        p_data["has_pcp"] = bool(p_data["has_pcp"])
        p_data["gender"] = str(p_data["gender"])
        p_data["primary_diagnosis"] = str(p_data["primary_diagnosis"])
        p_data["insurance"] = str(p_data["insurance"])

        missing_fields: List[str] = []
        if i % 7 == 3:
            missing_fields.append("insurance")

        p_df = pd.DataFrame([p_data])
        score = round(float(row["risk_score"]), 4)
        tier = _tier_for_score(score)
        drivers = compute_patient_risk_drivers(model, p_df, top_k=3)

        confidence_flags: List[str] = []
        if "insurance" in missing_fields:
            confidence_flags.append("insurance field missing")
        if not p_data["has_pcp"]:
            confidence_flags.append("Primary care provider (PCP) is not recorded")
        if p_data["age"] >= 80:
            confidence_flags.append("Advanced patient age requires review")

        pid = f"PT-{1000 + len(patient_records) + 1}"
        patient_records.append(
            {
                "id": pid,
                "name": f"Demo Patient {pid}",
                "display_name": f"Patient {pid}",
                "age": p_data["age"],
                "gender": p_data["gender"],
                "admission_count": p_data["admission_count"],
                "days_since_last_admission": p_data["days_since_last_admission"],
                "primary_diagnosis": p_data["primary_diagnosis"],
                "medical_condition": p_data["primary_diagnosis"],
                "admission_type": "Inpatient",
                "insurance": None if "insurance" in missing_fields else p_data["insurance"],
                "has_pcp": p_data["has_pcp"],
                "missing_fields": missing_fields,
                "risk_score": score,
                "risk_tier": tier,
                "risk_drivers": drivers,
                "confidence_flags": confidence_flags,
                "confidence_level": "review" if confidence_flags else "high",
                "action_templates": ACTION_TEMPLATE_OPTIONS[tier],
                "assigned_action_status": "pending",
                "demo_only": True,
            }
        )

    patient_records.sort(key=lambda x: x["risk_score"], reverse=True)
    return patient_records


if __name__ == "__main__":
    print("Generating scored synthetic demo patient records...")
    patients = generate_demo_patients()
    out_file = export_demo_patients_json(patients)
    print(f"Exported {len(patients)} scored demo patients to {out_file}")
