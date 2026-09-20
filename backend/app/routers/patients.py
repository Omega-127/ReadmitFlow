"""Patient endpoints router (GET /patients and GET /patients/{id})."""

from typing import Optional
from fastapi import APIRouter, Query

from app.core.safety import DATA_NOTICE
from app.schemas.patient import PatientDetailResponse, PatientListResponse
from app.services.patient_service import patient_service

router = APIRouter(tags=["Patients"])


@router.get(
    "/patients",
    response_model=None,
    summary="List prioritized synthetic patients",
    description=(
        "Returns a prioritized list of synthetic patients sorted by risk score descending. "
        "Supports optional text search across name/ID/condition, filtering by risk tier, "
        "and pagination limits."
    ),
)
def get_patients(
    query: Optional[str] = Query(
        None,
        description="Search string matching patient identifier, display name, or medical condition.",
    ),
    search: Optional[str] = Query(
        None,
        description="Alternative alias for query search.",
    ),
    risk_tier: Optional[str] = Query(
        None,
        description="Filter by risk tier: 'low', 'medium', or 'high'.",
    ),
    tier: Optional[str] = Query(
        None,
        description="Alternative alias for risk_tier parameter.",
    ),
    limit: int = Query(
        25,
        description="Maximum number of patient records to return (1-100, default 25).",
    ),
) -> dict:
    """Returns prioritized synthetic patient records wrapped in the standard envelope."""
    # Resolve aliases
    effective_query = search if search is not None else query
    effective_tier = tier if tier is not None else risk_tier

    patients = patient_service.list_patients(
        query=effective_query,
        risk_tier=effective_tier,
        limit=limit,
    )

    return {
        "demo_only": True,
        "data_notice": DATA_NOTICE,
        "patients": patients,
        "total": len(patients),
    }


@router.get(
    "/patients/{id}",
    response_model=None,
    summary="Get synthetic patient profile by ID",
    description=(
        "Returns the complete profile of a synthetic patient, including risk drivers, "
        "confidence indicators, data completeness flags, and workflow recommendation templates."
    ),
)
def get_patient(id: str) -> dict:
    """Retrieves a single synthetic patient by their identifier (e.g. PAT-0001)."""
    patient = patient_service.get_patient(id)

    return {
        "demo_only": True,
        "data_notice": DATA_NOTICE,
        "patient": patient,
    }
