"""
ml/src/feature_engineering.py

Transparent feature engineering for ReadmitFlow.
Extracts only verifiable and documented demographic, administrative, and chronological features.
Does not invent clinical assertions or unsupported diagnostic rules.
"""

from typing import Optional
import pandas as pd
import numpy as np


def compute_length_of_stay(df: pd.DataFrame) -> pd.Series:
    """
    Computes integer days between admission and discharge.
    Bounded between 0 and 365 to handle any anomalous records.
    """
    adm = pd.to_datetime(df.get("Date of Admission"), errors="coerce")
    dis = pd.to_datetime(df.get("Discharge Date"), errors="coerce")
    los = (dis - adm).dt.days
    return los.fillna(1).clip(lower=0, upper=365).astype(int)


def categorize_age_group(age_series: pd.Series) -> pd.Series:
    """
    Maps continuous age into standard administrative demographic bins:
    - Young adult: < 45
    - Middle adult: 45 - 64
    - Older adult: 65+
    """
    bins = [-1, 44, 64, 150]
    labels = ["<45", "45-64", "65+"]
    return pd.cut(age_series, bins=bins, labels=labels).astype(str)


def normalize_input_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Normalizes and cleans input fields for prediction or training:
    - Cleans gender strings ('Male' -> 'M', 'Female' -> 'F', 'M'/'F' preserved)
    - Clips age to [0, 120]
    - Ensures non-negative integer admission_count and days_since_last_admission
    - Fills missing values with standard safe defaults
    """
    df = df.copy()

    # Normalize age
    if "age" in df.columns:
        df["age"] = pd.to_numeric(df["age"], errors="coerce").fillna(50).clip(lower=0, upper=120)
    elif "Age" in df.columns:
        df["age"] = pd.to_numeric(df["Age"], errors="coerce").fillna(50).clip(lower=0, upper=120)

    # Normalize gender
    if "gender" in df.columns:
        df["gender"] = df["gender"].astype(str).str.upper().map({"MALE": "M", "FEMALE": "F", "M": "M", "F": "F"}).fillna("M")
    elif "Gender" in df.columns:
        df["gender"] = df["Gender"].astype(str).str.upper().map({"MALE": "M", "FEMALE": "F", "M": "M", "F": "F"}).fillna("M")

    # Normalize admission count
    if "admission_count" in df.columns:
        df["admission_count"] = pd.to_numeric(df["admission_count"], errors="coerce").fillna(0).clip(lower=0, upper=50)

    # Normalize days since last admission
    if "days_since_last_admission" in df.columns:
        df["days_since_last_admission"] = pd.to_numeric(df["days_since_last_admission"], errors="coerce").fillna(90).clip(lower=0, upper=365)

    # Normalize primary diagnosis
    if "primary_diagnosis" not in df.columns and "Medical Condition" in df.columns:
        df["primary_diagnosis"] = df["Medical Condition"].astype(str)
    elif "primary_diagnosis" in df.columns:
        df["primary_diagnosis"] = df["primary_diagnosis"].astype(str)

    # Normalize insurance
    if "insurance" not in df.columns and "Insurance Provider" in df.columns:
        df["insurance"] = df["Insurance Provider"].astype(str)
    elif "insurance" in df.columns:
        df["insurance"] = df["insurance"].astype(str)

    # Normalize has_pcp
    if "has_pcp" in df.columns:
        df["has_pcp"] = df["has_pcp"].astype(bool)
    else:
        df["has_pcp"] = False

    return df
