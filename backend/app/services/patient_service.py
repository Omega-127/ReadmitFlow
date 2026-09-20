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


class PatientService:
    """Service handling patient search, filtering, and detail extraction."""

    def __init__(self) -> None:
        self.repo = demo_data_repo

    def list_patients(
        self,
        query: Optional[str] = None,
        risk_tier: Optional[str] = None,
        limit: int = 25,
    ) -> PatientListResponse:
        """Returns a prioritized list of synthetic patients with optional filters.

        Args:
            query: Optional search string matching ID, display name, or condition.
            risk_tier: Optional filter by tier ('low', 'medium', 'high').
            limit: Maximum number of patients to return (clamped 1 to 100).

        Returns:
            PatientListResponse containing prioritized PatientSummary items.
        """
        # Ensure limit stays within safe boundaries
        clamped_limit = max(1, min(limit, 100))

        raw_patients = self.repo.get_all_patients()

        # 1. Prioritize patients by risk_score descending (highest risk first)
        sorted_patients = sorted(
            raw_patients,
            key=lambda p: float(p.get("risk_score", 0.0)),
            reverse=True,
        )

        filtered = []
        clean_query = query.strip().lower() if query else None
        clean_tier = risk_tier.strip().lower() if risk_tier else None

        for p in sorted_patients:
            # Filter by risk tier if specified
            if clean_tier and p.get("risk_tier", "").strip().lower() != clean_tier:
                continue

            # Search by display name, ID, or condition if query specified
            if clean_query:
                p_id = p.get("id", "").lower()
                p_name = p.get("display_name", "").lower()
                p_cond = p.get("medical_condition", "").lower()
                if (
                    clean_query not in p_id
                    and clean_query not in p_name
                    and clean_query not in p_cond
                ):
                    continue

            # Project into summarized queue item schema
            summary_item = PatientSummary(
                id=p.get("id", ""),
                display_name=p.get("display_name", f"Patient {p.get('id', '')}"),
                age=int(p.get("age", 0)),
                medical_condition=p.get("medical_condition", "Unknown"),
                admission_type=p.get("admission_type", "Standard"),
                risk_score=float(p.get("risk_score", 0.0)),
                risk_tier=p.get("risk_tier", "low"),
                confidence_level=p.get("confidence_level", "review"),
                assigned_action_status=p.get("assigned_action_status", "pending"),
            )
            filtered.append(summary_item)

            # Enforce page size limit
            if len(filtered) >= clamped_limit:
                break

        return PatientListResponse(
            demo_only=True,
            data_notice=DATA_NOTICE,
            patients=filtered,
        )

    def get_patient(self, patient_id: str) -> PatientDetailResponse:
        """Retrieves complete profile for a synthetic patient.

        Args:
            patient_id: Identifier of the patient (e.g. PAT-0001).

        Returns:
            PatientDetailResponse with full clinical and explanation attributes.

        Raises:
            HTTPException (404) if patient is not found.
        """
        raw_patient = self.repo.get_patient_by_id(patient_id)
        if not raw_patient:
            raise_patient_not_found(patient_id)

        # Parse into typed PatientDetail
        detail = PatientDetail(**raw_patient)

        return PatientDetailResponse(
            demo_only=True,
            data_notice=DATA_NOTICE,
            patient=detail,
        )


# Singleton instance of PatientService
patient_service = PatientService()
