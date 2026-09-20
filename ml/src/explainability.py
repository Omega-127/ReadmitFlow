"""
ml/src/explainability.py

Model explainability module using Logistic Regression coefficients.
Computes patient-level risk drivers without implying clinical causation.
Adheres strictly to the guidelines:
- "This feature contributes to the model's predicted risk." (never "causes readmission")
- Returns factor, direction ("increases" | "decreases"), weight (float), and plain-language summary.
"""

from typing import Dict, List, Optional
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline

from ml.src.preprocessing import extract_feature_names


FRIENDLY_FACTOR_NAMES = {
    "age": "Patient age",
    "admission_count": "Prior hospital admissions",
    "days_since_last_admission": "Recency of prior discharge",
    "has_pcp": "Primary care provider (PCP) status",
    "has_pcp_True": "Has recorded primary care provider",
    "has_pcp_False": "No recorded primary care provider",
    "gender_M": "Demographic gender (Male)",
    "gender_F": "Demographic gender (Female)",
    "primary_diagnosis_Cancer": "Primary condition: Cancer",
    "primary_diagnosis_Diabetes": "Primary condition: Diabetes",
    "primary_diagnosis_Hypertension": "Primary condition: Hypertension",
    "primary_diagnosis_Asthma": "Primary condition: Asthma",
    "primary_diagnosis_Obesity": "Primary condition: Obesity",
    "primary_diagnosis_Arthritis": "Primary condition: Arthritis",
    "insurance_Medicare": "Payer: Medicare",
    "insurance_Medicaid": "Payer: Medicaid",
    "insurance_Blue Cross": "Payer: Blue Cross",
    "insurance_Aetna": "Payer: Aetna",
    "insurance_UnitedHealthcare": "Payer: UnitedHealthcare",
    "insurance_Cigna": "Payer: Cigna",
}


def compute_patient_risk_drivers(
    model: Pipeline,
    patient_df: pd.DataFrame,
    top_k: int = 3,
) -> List[Dict[str, any]]:
    """
    Computes top model contributing factors for an individual patient record.
    Uses element-wise product of patient standardized feature values and model coefficients:
    contribution_i = X_standardized_i * beta_i

    Args:
        model: Fitted Pipeline with preprocessor and LogisticRegression classifier.
        patient_df: 1-row DataFrame containing patient features.
        top_k: Number of top drivers to return.

    Returns:
        List of dictionaries with keys:
        - factor: str
        - label: str (alias for factor)
        - direction: 'increases' | 'decreases'
        - weight: float (magnitude of contribution)
        - summary: str (non-causal explanatory statement)
    """
    preprocessor = model.named_steps["preprocessor"]
    classifier = model.named_steps["classifier"]

    # Transform patient record to feature space
    X_trans = preprocessor.transform(patient_df)
    if hasattr(X_trans, "toarray"):
        X_trans = X_trans.toarray()
    X_vec = X_trans[0]

    feature_names = extract_feature_names(preprocessor)
    coefficients = classifier.coef_[0]

    # Calculate contribution = feature_value * coefficient
    contributions = X_vec * coefficients

    drivers = []
    # Sort indices by absolute contribution magnitude
    sorted_indices = np.argsort(np.abs(contributions))[::-1]

    for idx in sorted_indices:
        feat_name = feature_names[idx] if idx < len(feature_names) else f"feature_{idx}"
        contrib = float(contributions[idx])
        
        # Skip negligible contributions
        if abs(contrib) < 1e-4:
            continue

        direction = "increases" if contrib > 0 else "decreases"
        friendly_label = FRIENDLY_FACTOR_NAMES.get(feat_name, feat_name.replace("_", " ").title())
        weight = round(abs(contrib), 2)
        summary = (
            f"{friendly_label} {direction} the model's predicted risk "
            f"(demo contribution weight: {weight:.2f})."
        )

        drivers.append(
            {
                "factor": friendly_label,
                "label": friendly_label,
                "direction": direction,
                "weight": weight,
                "summary": summary,
            }
        )

        if len(drivers) >= top_k:
            break

    return drivers
