"""Patient service for filtering, searching, and looking up synthetic records.

Provides business logic for the Command Center queue and Patient Review views.
"""

from typing import Optional

from app.core.errors import raise_patient_not_found
from app.core.safety import DATA_NOTICE
from app.repositories.demo_data_repository import demo_data_repo
from app.schemas.patient import (
    PatientDetail,
    PatientDetailResponse,
    PatientListResponse,
    PatientSummary,
)


FALLBACK_DEMO_PATIENTS = {
    "P001": {
        "id": "P001",
        "name": "Demo Patient A",
        "display_name": "Patient P001",
        "age": 67,
        "gender": "M",
        "risk_score": 0.82,
        "risk_tier": "HIGH",
        "admission_count": 3,
        "days_since_last_admission": 12,
        "primary_diagnosis": "Heart Failure",
        "medical_condition": "Heart Failure",
        "admission_type": "Inpatient",
        "insurance": "Medicare",
        "insurance_provider": "Medicare",
        "has_pcp": True,
        "missing_fields": [],
        "risk_drivers": [
            {"factor": "Prior admissions", "label": "Prior admissions", "direction": "increases", "weight": 0.41, "summary": "Prior admissions increases risk."},
            {"factor": "Days since last admission", "label": "Days since last admission", "direction": "increases", "weight": 0.28, "summary": "Recency increases risk."},
        ],
        "confidence_flags": [],
        "action_templates": ["Schedule 48h care-coordinator follow-up call", "Arrange home health visit"],
        "assigned_action_status": "pending",
        "demo_only": True,
    },
    "P002": {
        "id": "P002",
        "name": "Demo Patient B",
        "display_name": "Patient P002",
        "age": 45,
        "gender": "F",
        "risk_score": 0.51,
        "risk_tier": "MEDIUM",
        "admission_count": 1,
        "days_since_last_admission": 30,
        "primary_diagnosis": "COPD",
        "medical_condition": "COPD",
        "admission_type": "Inpatient",
        "insurance": "Medicaid",
        "insurance_provider": "Medicaid",
        "has_pcp": True,
        "missing_fields": ["insurance"],
        "risk_drivers": [
            {"factor": "Primary diagnosis", "label": "Primary diagnosis", "direction": "increases", "weight": 0.35, "summary": "COPD diagnosis increases risk."},
        ],
        "confidence_flags": ["insurance field missing"],
        "action_templates": ["Schedule clinic follow-up visit"],
        "assigned_action_status": "pending",
        "demo_only": True,
    },
    "P003": {
        "id": "P003",
        "name": "Demo Patient C",
        "display_name": "Patient P003",
        "age": 38,
        "gender": "F",
        "risk_score": 0.19,
        "risk_tier": "LOW",
        "admission_count": 0,
        "days_since_last_admission": 90,
        "primary_diagnosis": "Appendectomy",
        "medical_condition": "Appendectomy",
        "admission_type": "Inpatient",
        "insurance": "Commercial",
        "insurance_provider": "Commercial",
        "has_pcp": True,
        "missing_fields": [],
        "risk_drivers": [],
        "confidence_flags": [],
        "action_templates": ["Send electronic discharge summary"],
        "assigned_action_status": "pending",
        "demo_only": True,
    },
}


def _format_patient_record(p: dict) -> dict:
    """Format raw patient dictionary to ensure all required fields are normalized."""
    pid = str(p.get("id", ""))
    tier = str(p.get("risk_tier", "LOW")).upper()
    if tier not in {"HIGH", "MEDIUM", "LOW"}:
        tier = "LOW"

    diag = p.get("primary_diagnosis") or p.get("medical_condition") or "Other"
    ins = p.get("insurance") or p.get("insurance_provider") or "Unknown"

    drivers = []
    for d in p.get("risk_drivers", []):
        if isinstance(d, dict):
            factor_label = d.get("factor") or d.get("label") or "Risk factor"
            drivers.append({
                "factor": factor_label,
                "label": factor_label,
                "direction": d.get("direction", "increases"),
                "weight": float(d.get("weight", d.get("impact_weight", 0.1))),
                "summary": d.get("summary", f"{factor_label} affects risk."),
            })

    flags = list(p.get("confidence_flags", []))
    missing = p.get("missing_fields", [])
    if missing:
        for f in missing:
            flag_str = f"{f} field missing"
            if flag_str not in flags:
                flags.append(flag_str)

    actions = list(p.get("action_templates", p.get("recommendation_templates", [])))
    if not actions:
        actions = ["Schedule follow-up visit"]

    return {
        "id": pid,
        "name": p.get("name", f"Demo Patient {pid}"),
        "display_name": p.get("display_name", f"Patient {pid}"),
        "age": int(p.get("age", 50)),
        "gender": str(p.get("gender", "M")),
        "admission_count": int(p.get("admission_count", 0)),
        "days_since_last_admission": int(p.get("days_since_last_admission", 90)),
        "primary_diagnosis": str(diag),
        "medical_condition": str(diag),
        "admission_type": str(p.get("admission_type", "Inpatient")),
        "insurance": str(ins),
        "insurance_provider": str(ins),
        "has_pcp": bool(p.get("has_pcp", True)),
        "missing_fields": missing,
        "risk_score": float(p.get("risk_score", 0.2)),
        "risk_tier": tier,
        "risk_drivers": drivers,
        "confidence_flags": flags,
        "confidence_level": p.get("confidence_level", "high" if not flags else "review"),
        "action_templates": actions,
        "assigned_action_status": p.get("assigned_action_status", "pending"),
        "demo_only": True,
        "data_notice": DATA_NOTICE,
    }


class PatientService:
    """Service handling patient search, filtering, and detail extraction."""

    def __init__(self) -> None:
        self.repo = demo_data_repo

    def list_patients(
        self,
        query: Optional[str] = None,
        risk_tier: Optional[str] = None,
        limit: int = 25,
    ) -> list:
        """Returns a prioritized list of synthetic patient dictionaries."""
        if limit <= 0:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Limit must be a positive integer")

        clamped_limit = min(limit, 100)

        raw_patients = self.repo.get_all_patients()
        all_patients = [_format_patient_record(p) for p in raw_patients]

        # Sort by risk_score descending
        sorted_patients = sorted(
            all_patients,
            key=lambda p: float(p.get("risk_score", 0.0)),
            reverse=True,
        )

        filtered = []
        clean_query = query.strip().lower() if query else None
        clean_tier = risk_tier.strip().upper() if risk_tier else None

        if clean_tier in ("ALL", "ANY", "EVERY", ""):
            clean_tier = None

        if clean_tier and clean_tier not in {"HIGH", "MEDIUM", "LOW"}:
            return []

        for p in sorted_patients:
            if clean_tier and p["risk_tier"] != clean_tier:
                continue

            if clean_query:
                p_id = p["id"].lower()
                p_name = p["name"].lower()
                p_diag = p["primary_diagnosis"].lower()
                if clean_query not in p_id and clean_query not in p_name and clean_query not in p_diag:
                    continue

            filtered.append(p)
            if len(filtered) >= clamped_limit:
                break

        return filtered

    def get_patient(self, patient_id: str) -> dict:
        """Retrieves complete profile for a synthetic patient."""
        clean_id = patient_id.strip().upper()

        if clean_id in FALLBACK_DEMO_PATIENTS:
            return _format_patient_record(FALLBACK_DEMO_PATIENTS[clean_id])

        raw_patient = self.repo.get_patient_by_id(clean_id)
        if not raw_patient:
            # Check if any patient ID matches ignoring prefix or case
            for p in self.repo.get_all_patients():
                if str(p.get("id", "")).strip().upper() == clean_id:
                    raw_patient = p
                    break

        if not raw_patient:
            raise_patient_not_found(patient_id)

        return _format_patient_record(raw_patient)


# Singleton instance of PatientService
patient_service = PatientService()
