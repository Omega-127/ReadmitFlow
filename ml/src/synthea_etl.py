"""
ml/src/synthea_etl.py

Build an encounter-level training table from Synthea CSV exports.

Label definition (documented derived target):
  readmitted_30d = 1 if the same patient has a subsequent *inpatient*
  encounter starting within 30 days of the index inpatient discharge (STOP).

This is a synthetic EHR-derived label for prototype training — not a clinical
claim about real-world readmission risk.
"""

from __future__ import annotations

from pathlib import Path
from typing import Dict, Optional, Tuple

import numpy as np
import pandas as pd

PROJECT_ROOT = Path(__file__).resolve().parents[2]
DEFAULT_SYNTHEA_DIR = (
    PROJECT_ROOT / "dataset" / "synthea" / "raw" / "10k_synthea_covid19_csv"
)
DEFAULT_FEATURES_PATH = PROJECT_ROOT / "dataset" / "synthea" / "encounter_features.csv"

# Hospital-relevant encounter classes used as index / readmission events
INPATIENT_CLASSES = {"inpatient"}

DIAGNOSIS_RULES = [
    ("heart failure", "Heart Failure"),
    ("congestive heart", "Heart Failure"),
    ("chronic obstructive", "COPD"),
    ("copd", "COPD"),
    ("pneumonia", "Pneumonia"),
    ("covid", "COVID-19"),
    ("coronavirus", "COVID-19"),
    ("diabetes", "Diabetes"),
    ("hypertension", "Hypertension"),
    ("asthma", "Asthma"),
    ("malignant", "Cancer"),
    ("carcinoma", "Cancer"),
    ("cancer", "Cancer"),
    ("sepsis", "Sepsis"),
    ("stroke", "Stroke"),
    ("cerebrovascular", "Stroke"),
    ("myocardial", "Cardiac Ischemia"),
    ("coronary", "Cardiac Ischemia"),
    ("kidney", "Kidney Disease"),
    ("renal", "Kidney Disease"),
    ("obesity", "Obesity"),
]


def _require_file(directory: Path, name: str) -> Path:
    path = directory / name
    if not path.exists():
        raise FileNotFoundError(
            f"Required Synthea file missing: {path}. "
            "Download the COVID-19 10K CSV sample into dataset/synthea/raw/."
        )
    return path


def map_diagnosis(description: Optional[str]) -> str:
    """Map free-text Synthea condition / reason text to a compact category."""
    if description is None or (isinstance(description, float) and np.isnan(description)):
        return "Other"
    text = str(description).strip().lower()
    if not text or text == "nan":
        return "Other"
    for needle, label in DIAGNOSIS_RULES:
        if needle in text:
            return label
    return "Other"


def _load_tables(synthea_dir: Path) -> Dict[str, pd.DataFrame]:
    patients = pd.read_csv(_require_file(synthea_dir, "patients.csv"))
    encounters = pd.read_csv(_require_file(synthea_dir, "encounters.csv"))
    conditions = pd.read_csv(_require_file(synthea_dir, "conditions.csv"))
    payers = pd.read_csv(_require_file(synthea_dir, "payers.csv"))
    return {
        "patients": patients,
        "encounters": encounters,
        "conditions": conditions,
        "payers": payers,
    }


def _primary_condition_by_encounter(conditions: pd.DataFrame) -> pd.Series:
    """Pick the earliest condition description per encounter as primary diagnosis text."""
    if conditions.empty:
        return pd.Series(dtype=object)
    ordered = conditions.sort_values(["ENCOUNTER", "START"], kind="mergesort")
    return ordered.groupby("ENCOUNTER", sort=False)["DESCRIPTION"].first()


def build_synthea_features(
    synthea_dir: Optional[Path] = None,
    readmission_window_days: int = 30,
) -> Tuple[pd.DataFrame, Dict[str, object]]:
    """
    Construct a flat feature table with derived readmitted_30d labels.

    Returns:
        (features_df, metadata)
    """
    directory = Path(synthea_dir) if synthea_dir else DEFAULT_SYNTHEA_DIR
    tables = _load_tables(directory)
    patients = tables["patients"]
    encounters = tables["encounters"]
    conditions = tables["conditions"]
    payers = tables["payers"]

    encounters = encounters.copy()
    encounters["START"] = pd.to_datetime(encounters["START"], utc=True, errors="coerce")
    encounters["STOP"] = pd.to_datetime(encounters["STOP"], utc=True, errors="coerce")
    encounters["ENCOUNTERCLASS"] = (
        encounters["ENCOUNTERCLASS"].astype(str).str.lower().str.strip()
    )

    inpatient = encounters[
        encounters["ENCOUNTERCLASS"].isin(INPATIENT_CLASSES)
        & encounters["START"].notna()
        & encounters["STOP"].notna()
    ].copy()
    inpatient = inpatient.sort_values(["PATIENT", "START", "STOP"]).reset_index(drop=True)

    # Derived 30-day inpatient readmission label
    inpatient["next_start"] = inpatient.groupby("PATIENT")["START"].shift(-1)
    days_to_next = (inpatient["next_start"] - inpatient["STOP"]).dt.total_seconds() / 86400.0
    inpatient["days_to_next_inpatient"] = days_to_next
    inpatient["readmitted_30d"] = (
        days_to_next.notna() & (days_to_next >= 0) & (days_to_next <= readmission_window_days)
    ).astype(int)

    # Prior utilization features (computed before excluding terminal stays)
    inpatient["admission_count"] = inpatient.groupby("PATIENT").cumcount()
    prev_stop = inpatient.groupby("PATIENT")["STOP"].shift(1)
    days_since = (inpatient["START"] - prev_stop).dt.total_seconds() / 86400.0
    inpatient["days_since_last_admission"] = (
        days_since.fillna(90).clip(lower=0, upper=365).round().astype(int)
    )

    # Patient demographics
    patient_cols = patients[
        ["Id", "BIRTHDATE", "DEATHDATE", "GENDER"]
    ].rename(columns={"Id": "PATIENT"})
    patient_cols["BIRTHDATE"] = pd.to_datetime(patient_cols["BIRTHDATE"], errors="coerce")
    patient_cols["DEATHDATE"] = pd.to_datetime(patient_cols["DEATHDATE"], errors="coerce")

    frame = inpatient.merge(patient_cols, on="PATIENT", how="left")

    # Exclude deaths during the index stay — no post-discharge readmission opportunity
    stop_naive = frame["STOP"].dt.tz_convert(None)
    death_naive = pd.to_datetime(frame["DEATHDATE"], errors="coerce")
    death_during_stay = death_naive.notna() & (death_naive <= stop_naive)
    frame = frame.loc[~death_during_stay].copy()

    age_years = (frame["START"].dt.tz_convert(None) - frame["BIRTHDATE"]).dt.days / 365.25
    frame["age"] = age_years.fillna(50).clip(lower=0, upper=120).round().astype(int)
    frame["gender"] = (
        frame["GENDER"]
        .astype(str)
        .str.upper()
        .map({"M": "M", "F": "F", "MALE": "M", "FEMALE": "F"})
        .fillna("M")
    )

    # Primary diagnosis from encounter reason, else linked condition
    cond_map = _primary_condition_by_encounter(conditions)
    frame["condition_text"] = frame["Id"].map(cond_map)
    reason = frame["REASONDESCRIPTION"].astype(str)
    condition_text = frame["condition_text"].astype(str)
    primary_text = reason.where(
        reason.notna() & ~reason.isin(["", "nan", "None"]),
        condition_text,
    )
    frame["primary_diagnosis"] = primary_text.map(map_diagnosis)

    # Insurance / payer
    payer_names = payers.set_index("Id")["NAME"].to_dict()
    frame["insurance"] = frame["PAYER"].map(payer_names).fillna("Unknown")

    # has_pcp: any prior wellness encounter for the patient
    wellness = encounters[encounters["ENCOUNTERCLASS"] == "wellness"][
        ["PATIENT", "START"]
    ].rename(columns={"START": "wellness_start"})
    wellness_joined = frame[["Id", "PATIENT", "START"]].merge(
        wellness, on="PATIENT", how="left"
    )
    wellness_joined["prior_wellness"] = wellness_joined["wellness_start"] < wellness_joined["START"]
    has_pcp = (
        wellness_joined.groupby("Id", sort=False)["prior_wellness"]
        .any()
        .reindex(frame["Id"])
        .fillna(False)
    )
    frame["has_pcp"] = has_pcp.astype(bool).to_numpy()

    frame["target"] = frame["readmitted_30d"].astype(int)
    frame["length_of_stay"] = (
        (frame["STOP"] - frame["START"]).dt.total_seconds() / 86400.0
    ).clip(lower=0, upper=365).round().astype(int)
    frame["admission_type"] = "Inpatient"
    frame["source_patient_id"] = frame["PATIENT"]
    frame["source_encounter_id"] = frame["Id"]

    features = frame[
        [
            "source_patient_id",
            "source_encounter_id",
            "age",
            "gender",
            "admission_count",
            "days_since_last_admission",
            "primary_diagnosis",
            "insurance",
            "has_pcp",
            "length_of_stay",
            "admission_type",
            "readmitted_30d",
            "target",
        ]
    ].reset_index(drop=True)

    metadata = {
        "source": "Synthea COVID-19 10K CSV sample",
        "source_dir": str(directory),
        "label_definition": (
            f"Derived inpatient-to-inpatient return within {readmission_window_days} days "
            "of discharge (STOP -> next inpatient START)."
        ),
        "is_demo_proxy": False,
        "is_synthetic_derived_label": True,
        "total_samples": int(len(features)),
        "positive_rate": float(features["readmitted_30d"].mean()) if len(features) else 0.0,
        "diagnosis_distribution": features["primary_diagnosis"].value_counts().to_dict(),
        "excluded_death_during_stay": int(death_during_stay.sum()),
    }
    return features, metadata


def export_synthea_features(
    synthea_dir: Optional[Path] = None,
    output_path: Optional[Path] = None,
) -> Tuple[Path, Dict[str, object]]:
    """Build features and write dataset/synthea/encounter_features.csv."""
    features, metadata = build_synthea_features(synthea_dir=synthea_dir)
    out = Path(output_path) if output_path else DEFAULT_FEATURES_PATH
    out.parent.mkdir(parents=True, exist_ok=True)
    features.to_csv(out, index=False)
    metadata["output_path"] = str(out)
    return out, metadata


def load_synthea_training_frame(
    features_path: Optional[Path] = None,
    synthea_dir: Optional[Path] = None,
    rebuild: bool = False,
) -> Tuple[pd.DataFrame, Dict[str, object]]:
    """
    Load cached encounter_features.csv, or rebuild from raw Synthea CSVs.
    """
    path = Path(features_path) if features_path else DEFAULT_FEATURES_PATH
    if path.exists() and not rebuild:
        df = pd.read_csv(path)
        metadata = {
            "source": "cached Synthea encounter_features.csv",
            "output_path": str(path),
            "total_samples": int(len(df)),
            "positive_rate": float(df["readmitted_30d"].mean()) if "readmitted_30d" in df else 0.0,
            "is_demo_proxy": False,
            "is_synthetic_derived_label": True,
            "label_definition": (
                "Derived inpatient-to-inpatient return within 30 days of discharge."
            ),
        }
        return df, metadata

    out, metadata = export_synthea_features(synthea_dir=synthea_dir, output_path=path)
    df = pd.read_csv(out)
    return df, metadata
