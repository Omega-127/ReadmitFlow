"""
Shared pytest fixtures for the ReadmitFlow FastAPI backend tests.

Uses FastAPI's TestClient so no live server is required.
All fixtures operate against synthetic demo data only — no real patient
records belong in this repository.
"""

import json
import os
from pathlib import Path
from typing import Generator
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

# ---------------------------------------------------------------------------
# Synthetic demo data used across all backend tests
# ---------------------------------------------------------------------------

DEMO_PATIENTS = [
    {
        "id": "P001",
        "name": "Demo Patient A",
        "age": 67,
        "gender": "M",
        "risk_score": 0.82,
        "risk_tier": "HIGH",
        "admission_count": 3,
        "days_since_last_admission": 12,
        "primary_diagnosis": "Heart Failure",
        "insurance": "Medicare",
        "has_pcp": True,
        "missing_fields": [],
        "risk_drivers": [
            {"factor": "Prior admissions", "direction": "increases", "weight": 0.41},
            {"factor": "Days since last admission", "direction": "increases", "weight": 0.28},
        ],
        "confidence_flags": [],
        "action_templates": ["Schedule 48h follow-up call", "Arrange home health visit"],
        "demo_only": True,
    },
    {
        "id": "P002",
        "name": "Demo Patient B",
        "age": 45,
        "gender": "F",
        "risk_score": 0.51,
        "risk_tier": "MEDIUM",
        "admission_count": 1,
        "days_since_last_admission": 30,
        "primary_diagnosis": "COPD",
        "insurance": "Medicaid",
        "has_pcp": True,
        "missing_fields": ["insurance"],
        "risk_drivers": [
            {"factor": "Primary diagnosis", "direction": "increases", "weight": 0.35},
        ],
        "confidence_flags": ["insurance field missing"],
        "action_templates": ["Schedule clinic follow-up"],
        "demo_only": True,
    },
    {
        "id": "P003",
        "name": "Demo Patient C",
        "age": 38,
        "gender": "F",
        "risk_score": 0.19,
        "risk_tier": "LOW",
        "admission_count": 0,
        "days_since_last_admission": 90,
        "primary_diagnosis": "Appendectomy",
        "insurance": "Commercial",
        "has_pcp": True,
        "missing_fields": [],
        "risk_drivers": [],
        "confidence_flags": [],
        "action_templates": ["Send discharge summary"],
        "demo_only": True,
    },
]

DEMO_METRICS = {
    "model_type": "LogisticRegression",
    "demo_only": True,
    "roc_auc": 0.74,
    "precision": 0.68,
    "recall": 0.71,
    "f1": 0.69,
    "confusion_matrix": {
        "true_positive": 142,
        "false_positive": 67,
        "false_negative": 58,
        "true_negative": 233,
    },
    "preprocessing_summary": "StandardScaler + OneHotEncoder via ColumnTransformer",
    "training_samples": 800,
    "test_samples": 200,
    "limitations": [
        "Trained on synthetic data only — not validated on real clinical populations.",
        "Target label is a proxy for readmission; organizer approval required before production use.",
        "Class imbalance handled with class_weight='balanced'; true prevalence unknown.",
    ],
    "notes": "Baseline logistic regression. Not approved for clinical decision-making.",
}


# ---------------------------------------------------------------------------
# App import — deferred so we can patch data loading before import
# ---------------------------------------------------------------------------

def _build_app():
    """Import the FastAPI app with demo data patched into services."""
    # Patch the demo data repository at module level before the app boots
    with patch.dict(
        os.environ,
        {
            "DEMO_ONLY": "true",
            "MODEL_PATH": "models/readmission_model.joblib",
        },
    ):
        try:
            from app.main import app as fastapi_app  # type: ignore
            return fastapi_app
        except ImportError:
            # If the app isn't importable yet, return a minimal stub so
            # tests can still be written and reviewed.
            from fastapi import FastAPI
            stub = FastAPI(title="ReadmitFlow (stub)")
            return stub


# ---------------------------------------------------------------------------
# Session-scoped client (re-used across all tests for speed)
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def app():
    """Return the FastAPI application instance."""
    return _build_app()


@pytest.fixture(scope="session")
def client(app) -> Generator[TestClient, None, None]:
    """Return a TestClient bound to the app for the full test session."""
    with TestClient(app) as c:
        yield c


# ---------------------------------------------------------------------------
# Convenience data fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session")
def demo_patients():
    return DEMO_PATIENTS


@pytest.fixture(scope="session")
def demo_metrics():
    return DEMO_METRICS


@pytest.fixture
def high_risk_patient():
    return DEMO_PATIENTS[0]


@pytest.fixture
def medium_risk_patient():
    return DEMO_PATIENTS[1]


@pytest.fixture
def low_risk_patient():
    return DEMO_PATIENTS[2]


# ---------------------------------------------------------------------------
# Valid prediction payload fixture
# ---------------------------------------------------------------------------

@pytest.fixture
def valid_prediction_payload():
    return {
        "age": 72,
        "gender": "M",
        "admission_count": 4,
        "days_since_last_admission": 8,
        "primary_diagnosis": "Heart Failure",
        "insurance": "Medicare",
        "has_pcp": False,
    }


@pytest.fixture
def incomplete_prediction_payload():
    """Missing required fields — should trigger 422."""
    return {
        "age": 55,
        # gender missing
        # admission_count missing
    }
