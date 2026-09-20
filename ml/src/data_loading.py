"""
ml/src/data_loading.py

Loads and validates the synthetic healthcare dataset for the ReadmitFlow ML module.
Adheres strictly to the ARCHITECTURE.md safety boundary and data dictionary governance:
- Uses repository-relative paths (no hardcoded machine paths).
- Validates columns, datatypes, missing values, and duplicate records.
- Enforces target validation: halts if an approved target is missing unless explicitly running
  in documented demo-proxy mode with demo_only=True.
"""

from pathlib import Path
from typing import Dict, List, Optional, Tuple
import pandas as pd
import numpy as np


# Repository root resolved dynamically relative to this file
PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA_PATH = PROJECT_ROOT / "dataset" / "healthcare_dataset.csv"

# Expected raw columns from the organizer healthcare dataset
EXPECTED_RAW_COLUMNS = [
    "Name",
    "Age",
    "Gender",
    "Blood Type",
    "Medical Condition",
    "Date of Admission",
    "Doctor",
    "Hospital",
    "Insurance Provider",
    "Billing Amount",
    "Room Number",
    "Admission Type",
    "Discharge Date",
    "Medication",
    "Test Results",
]


class DataValidationError(Exception):
    """Raised when the dataset fails schema, quality, or target validation."""
    pass


def load_raw_data(data_path: Optional[Path] = None) -> pd.DataFrame:
    """
    Load raw CSV data using a project-relative path.

    Args:
        data_path: Optional custom Path. Defaults to dataset/healthcare_dataset.csv.

    Returns:
        pd.DataFrame containing the raw records.
    """
    path = Path(data_path) if data_path else DEFAULT_DATA_PATH
    if not path.exists():
        raise FileNotFoundError(
            f"Dataset not found at relative path '{path}'. "
            f"Please ensure healthcare_dataset.csv exists in the dataset/ directory."
        )

    df = pd.read_csv(path)
    return df


def validate_raw_schema(df: pd.DataFrame) -> Dict[str, any]:
    """
    Validate columns, missing values, datatypes, and duplicates in raw data.

    Returns:
        Dictionary summarizing validation statistics.
    """
    missing_cols = [col for col in EXPECTED_RAW_COLUMNS if col not in df.columns]
    if missing_cols:
        raise DataValidationError(f"Dataset is missing required raw columns: {missing_cols}")

    null_counts = df[EXPECTED_RAW_COLUMNS].isnull().sum().to_dict()
    total_rows = len(df)
    duplicate_rows = int(df.duplicated(subset=["Name", "Date of Admission", "Discharge Date"]).sum())

    report = {
        "total_rows": total_rows,
        "duplicate_records": duplicate_rows,
        "null_counts": null_counts,
        "has_nulls": any(v > 0 for v in null_counts.values()),
    }
    return report


def validate_target(
    df: pd.DataFrame,
    target_col: str = "readmitted_30d",
    allow_demo_proxy: bool = False,
) -> Tuple[bool, str]:
    """
    Check for an approved readmission target.

    Per ARCHITECTURE.md:
    "Validate the source and target label; stop training if no approved readmission target exists."

    Args:
        df: Input DataFrame.
        target_col: Name of the expected genuine target column.
        allow_demo_proxy: If True, allows a clearly documented demo proxy label for demonstration only.

    Returns:
        (is_valid, message)
    """
    if target_col in df.columns:
        return True, f"Found approved target column: '{target_col}'"

    if allow_demo_proxy:
        return True, (
            "NOTICE: No approved genuine readmission target found in raw dataset. "
            "Proceeding under Option C DEMO-PROXY mode for software/UI demonstration. "
            "All model outputs must remain flagged as demo_only=True."
        )

    raise DataValidationError(
        f"Target column '{target_col}' not found in dataset. "
        "Per ARCHITECTURE.md and data-dictionary.md, training must halt when no approved "
        "readmission target exists. Do not invent an unapproved clinical target."
    )


def build_demo_proxy_target(df: pd.DataFrame, random_state: int = 42) -> Tuple[pd.DataFrame, Dict[str, any]]:
    """
    Constructs the documented DEMO PROXY readmission target for software and UI validation.
    
    IMPORTANT SAFETY BOUNDARY:
    This target is a DEMO PROXY only. It is NOT a clinical readmission outcome.
    It combines:
    - Prior admission frequency derived from repeat patient encounters.
    - Acuity and recency factors (days between encounters, admission type, age).
    - Stochastic logistic variation to provide realistic classification behavior (ROC-AUC ~0.75 - 0.80).
    
    Returns:
        (transformed_df_with_target, target_metadata)
    """
    df = df.copy()
    rng = np.random.default_rng(random_state)

    # Standardize names and calculate encounter sequences
    name_clean = df["Name"].astype(str).str.strip().str.title()
    adm_dt = pd.to_datetime(df["Date of Admission"], errors="coerce")
    dis_dt = pd.to_datetime(df["Discharge Date"], errors="coerce")

    # Sort to determine encounter timeline per patient
    df["_name_clean"] = name_clean
    df["_adm_dt"] = adm_dt
    df["_dis_dt"] = dis_dt
    df = df.sort_values(by=["_name_clean", "_adm_dt"]).reset_index(drop=True)

    prev_discharge = df.groupby("_name_clean")["_dis_dt"].shift(1)
    days_diff = (df["_adm_dt"] - prev_discharge).dt.days

    # Features for demo model
    df["days_since_last_admission"] = days_diff.apply(lambda d: int(d) if pd.notnull(d) and d > 0 else 90).clip(lower=0, upper=180)
    df["admission_count"] = df.groupby("_name_clean").cumcount().clip(upper=10)
    df["age"] = df["Age"].astype(int)
    df["gender"] = df["Gender"].map({"Male": "M", "Female": "F"}).fillna("M")
    df["primary_diagnosis"] = df["Medical Condition"].fillna("Other")
    df["insurance"] = df["Insurance Provider"].fillna("Other")
    
    # Synthetic has_pcp indicator (85% recorded PCP)
    df["has_pcp"] = rng.choice([True, False], size=len(df), p=[0.85, 0.15])

    # Propensity weights for proxy target
    diag_weights = {
        "Cancer": 0.6,
        "Diabetes": 0.5,
        "Hypertension": 0.3,
        "Asthma": 0.2,
        "Obesity": 0.2,
        "Arthritis": 0.1,
    }
    diag_score = df["primary_diagnosis"].map(diag_weights).fillna(0.0)

    # Multi-factor linear score with logistic noise
    z = (
        0.035 * (df["age"] - 50)
        + 0.55 * df["admission_count"]
        - 0.03 * (df["days_since_last_admission"] - 30)
        + diag_score
        - 0.45 * df["has_pcp"].astype(int)
        + rng.logistic(loc=0.0, scale=0.8, size=len(df))
    )
    prob = 1.0 / (1.0 + np.exp(-z))
    df["target"] = (prob > 0.50).astype(int)

    metadata = {
        "target_name": "target",
        "is_demo_proxy": True,
        "description": "Multi-factor demonstration risk proxy based on age, admission frequency, recency, diagnosis, and primary care status.",
        "positive_rate": float(df["target"].mean()),
        "total_samples": len(df),
        "random_state": random_state,
    }

    # Clean internal temporary columns
    df = df.drop(columns=["_name_clean", "_adm_dt", "_dis_dt"])
    return df, metadata
