"""
ml/prepare_demo_data.py

Generates scored, synthetic demo patient records using the trained model artifact.
Exports to backend/data/demo_patients.json.
Ensures:
- Synthetic anonymized names (no real patient information).
- High, Medium, and Low risk cohorts.
- Sorted by risk_score descending.
- All records marked demo_only=True.
- Risk drivers generated from actual model coefficients.
"""

from pathlib import Path
from typing import List, Dict, Optional
import pandas as pd
import numpy as np
import joblib

from ml.src.explainability import compute_patient_risk_drivers
from ml.src.export import export_demo_patients_json, BACKEND_MODELS_DIR


ACTION_TEMPLATE_OPTIONS = {
    "HIGH": [
        "Schedule 48h care-coordinator follow-up call",
        "Arrange home health visit & medication review",
        "Specialist urgent consult request",
    ],
    "MEDIUM": [
        "Schedule 7-day clinic follow-up visit",
        "Medication reconciliation review",
        "Dietary and disease-management consultation",
    ],
    "LOW": [
        "Send electronic discharge summary to patient portal",
        "Provide routine educational follow-up pamphlet",
        "Confirm scheduled outpatient follow-up in 30 days",
    ],
}


def generate_demo_patients(
    model_path: Optional[Path] = None,
    num_patients: int = 50,
    random_state: int = 42,
) -> List[Dict[str, any]]:
    """
    Generates realistic, de-identified synthetic patients scored by the trained model.
    """
    path = Path(model_path) if model_path else BACKEND_MODELS_DIR / "readmission_model.joblib"
    if not path.exists():
        raise FileNotFoundError(f"Trained model artifact not found at {path}. Run train.py first.")

    model = joblib.load(path)
    rng = np.random.default_rng(random_state)

    diagnoses = ["Heart Failure", "COPD", "Diabetes", "Hypertension", "Asthma", "Cancer", "Arthritis", "Obesity"]
    insurances = ["Medicare", "Medicaid", "Blue Cross", "Aetna", "UnitedHealthcare", "Cigna"]

    # Pre-seed diverse archetypes to guarantee HIGH, MEDIUM, and LOW representation
    archetypes = [
        # High risk archetypes
        {"age": 78, "gender": "M", "admission_count": 5, "days_since_last_admission": 6, "primary_diagnosis": "Heart Failure", "insurance": "Medicare", "has_pcp": False},
        {"age": 82, "gender": "F", "admission_count": 4, "days_since_last_admission": 12, "primary_diagnosis": "COPD", "insurance": "Medicaid", "has_pcp": False},
        {"age": 71, "gender": "M", "admission_count": 3, "days_since_last_admission": 15, "primary_diagnosis": "Diabetes", "insurance": "Medicare", "has_pcp": True},
        # Medium risk archetypes
        {"age": 58, "gender": "F", "admission_count": 2, "days_since_last_admission": 35, "primary_diagnosis": "Hypertension", "insurance": "Blue Cross", "has_pcp": True},
        {"age": 52, "gender": "M", "admission_count": 1, "days_since_last_admission": 42, "primary_diagnosis": "Asthma", "insurance": "Aetna", "has_pcp": False},
        {"age": 64, "gender": "F", "admission_count": 2, "days_since_last_admission": 50, "primary_diagnosis": "Cancer", "insurance": "UnitedHealthcare", "has_pcp": True},
        # Low risk archetypes
        {"age": 29, "gender": "F", "admission_count": 0, "days_since_last_admission": 120, "primary_diagnosis": "Arthritis", "insurance": "Cigna", "has_pcp": True},
        {"age": 34, "gender": "M", "admission_count": 0, "days_since_last_admission": 90, "primary_diagnosis": "Asthma", "insurance": "Blue Cross", "has_pcp": True},
        {"age": 24, "gender": "F", "admission_count": 0, "days_since_last_admission": 150, "primary_diagnosis": "Obesity", "insurance": "Aetna", "has_pcp": True},
    ]

    patient_records = []
    
    for i in range(num_patients):
        if i < len(archetypes):
            p_data = archetypes[i].copy()
        else:
            p_data = {
                "age": int(rng.integers(22, 88)),
                "gender": str(rng.choice(["M", "F"])),
                "admission_count": int(rng.choice([0, 1, 2, 3, 4, 5], p=[0.35, 0.25, 0.18, 0.12, 0.06, 0.04])),
                "days_since_last_admission": int(rng.integers(4, 180)),
                "primary_diagnosis": str(rng.choice(diagnoses)),
                "insurance": str(rng.choice(insurances)),
                "has_pcp": bool(rng.choice([True, False], p=[0.82, 0.18])),
            }

        # Intentional synthetic missing field on selected records to test data quality confidence flags
        missing_fields = []
        if i % 7 == 3:
            missing_fields.append("insurance")

        p_df = pd.DataFrame([p_data])
        
        # Predict probability
        score = float(model.predict_proba(p_df)[:, 1][0])
        score = round(score, 4)

        # Risk tier definition
        if score >= 0.70:
            tier = "HIGH"
        elif score >= 0.40:
            tier = "MEDIUM"
        else:
            tier = "LOW"

        # Generate model-based risk drivers
        drivers = compute_patient_risk_drivers(model, p_df, top_k=3)

        # Confidence flags
        confidence_flags = []
        if "insurance" in missing_fields:
            confidence_flags.append("insurance field missing")
        if not p_data["has_pcp"]:
            confidence_flags.append("Primary care provider (PCP) is not recorded")
        if p_data["age"] >= 80:
            confidence_flags.append("Advanced patient age requires review")

        pid = f"PT-{1000 + i + 1}"
        record = {
            "id": pid,
            "name": f"Demo Patient {pid}",
            "display_name": f"Patient {pid}",
            "age": p_data["age"],
            "gender": p_data["gender"],
            "admission_count": p_data["admission_count"],
            "days_since_last_admission": p_data["days_since_last_admission"],
            "primary_diagnosis": p_data["primary_diagnosis"],
            "medical_condition": p_data["primary_diagnosis"],
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
        patient_records.append(record)

    # Sort descending by risk score (required by queue and test suite)
    patient_records.sort(key=lambda x: x["risk_score"], reverse=True)
    return patient_records


if __name__ == "__main__":
    print("Generating scored synthetic demo patient records...")
    patients = generate_demo_patients()
    out_file = export_demo_patients_json(patients)
    print(f"Exported {len(patients)} scored demo patients to {out_file}")
