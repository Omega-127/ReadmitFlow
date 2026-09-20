"""Pydantic schemas for patient records and responses."""

from typing import List, Optional
from pydantic import BaseModel, Field

from app.core.safety import DATA_NOTICE
from app.schemas.common import ConfidenceInfo, RiskDriver


class PatientSummary(BaseModel):
    """Summarized patient record for the prioritized queue."""

    id: str = Field(..., description="Synthetic patient identifier (e.g. PAT-0001)")
    display_name: str = Field(..., description="Anonymized display label")
    age: int = Field(..., ge=0, le=120, description="Patient age")
    medical_condition: str = Field(..., description="Primary clinical condition")
    admission_type: str = Field(..., description="Admission acuity: Emergency, Urgent, Elective")
    risk_score: float = Field(..., ge=0.0, le=1.0, description="Model or demo risk score (0.0 to 1.0)")
    risk_tier: str = Field(..., description="Risk tier: low, medium, or high")
    confidence_level: str = Field(default="review", description="Input confidence assessment")
    assigned_action_status: str = Field(
        default="pending", description="Workflow state: pending, in_progress, completed"
    )


class PatientDetail(PatientSummary):
    """Detailed patient profile for comprehensive clinical review."""

    gender: str = Field(..., description="Patient gender")
    blood_type: Optional[str] = Field(None, description="Blood type")
    admission_date: Optional[str] = Field(None, description="ISO admission date")
    discharge_date: Optional[str] = Field(None, description="ISO discharge date")
    hospital: Optional[str] = Field(None, description="Admitting healthcare facility")
    insurance_provider: Optional[str] = Field(None, description="Insurance carrier")
    billing_amount: Optional[float] = Field(None, ge=0.0, description="Synthetic billing amount")
    medication: Optional[str] = Field(None, description="Discharge medication")
    test_results: Optional[str] = Field(None, description="Diagnostic lab summary")
    risk_drivers: List[RiskDriver] = Field(
        default_factory=list, description="Plain-language contributing risk factors"
    )
    confidence: ConfidenceInfo = Field(
        ..., description="Data completeness and confidence guard flags"
    )
    recommendation_templates: List[str] = Field(
        default_factory=list, description="Suggested follow-up workflow templates"
    )


class PatientListResponse(BaseModel):
    """API response envelope for GET /patients."""

    demo_only: bool = Field(
        default=True, description="Safety flag indicating non-diagnostic demo data"
    )
    data_notice: str = Field(
        default=DATA_NOTICE, description="Clinical safety boundary notice"
    )
    patients: List[PatientSummary] = Field(
        ..., description="Prioritized list of synthetic patients"
    )


class PatientDetailResponse(BaseModel):
    """API response envelope for GET /patients/{id}."""

    demo_only: bool = Field(
        default=True, description="Safety flag indicating non-diagnostic demo data"
    )
    data_notice: str = Field(
        default=DATA_NOTICE, description="Clinical safety boundary notice"
    )
    patient: PatientDetail = Field(
        ..., description="Complete synthetic patient profile"
    )
