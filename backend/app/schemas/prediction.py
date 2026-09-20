from typing import Any, List, Optional
from pydantic import BaseModel, Field, model_validator

from app.schemas.common import ConfidenceInfo, RiskDriver


VALID_GENDERS = {"M", "F", "MALE", "FEMALE", "OTHER"}

class PredictionRequest(BaseModel):
    """Payload schema for manual synthetic patient risk evaluation (POST /predict)."""

    age: int = Field(
        ...,
        gt=0,
        le=120,
        description="Patient age in years (must be between 1 and 120)",
        examples=[67],
    )
    gender: str = Field(
        ...,
        description="Patient gender (e.g. Female, Male, Other)",
        examples=["Female"],
    )
    medical_condition: Optional[str] = Field(
        default=None,
        description="Primary clinical condition (e.g. Diabetes, Hypertension, Heart Failure)",
        examples=["Diabetes"],
    )
    primary_diagnosis: Optional[str] = Field(
        default=None,
        description="Alias for medical_condition",
    )
    admission_type: Optional[str] = Field(
        default="Inpatient",
        description="Admission type: Emergency, Urgent, Inpatient, or Elective",
        examples=["Urgent"],
    )
    insurance_provider: Optional[str] = Field(
        default=None,
        description="Insurance provider name",
        examples=["Medicare"],
    )
    insurance: Optional[str] = Field(
        default=None,
        description="Alias for insurance_provider",
    )
    admission_count: Optional[int] = Field(
        default=0,
        ge=0,
        description="Number of prior admissions",
    )
    days_since_last_admission: Optional[int] = Field(
        default=90,
        ge=0,
        description="Days since prior discharge",
    )
    has_pcp: Optional[bool] = Field(
        default=True,
        description="Primary care provider assigned flag",
    )
    billing_amount: Optional[float] = Field(
        default=0.0,
        ge=0.0,
        description="Billing amount in USD (must be non-negative)",
        examples=[18000.0],
    )
    medication: Optional[str] = Field(
        default=None,
        description="Active medication",
        examples=["Metformin"],
    )
    blood_type: Optional[str] = Field(
        default=None,
        description="Blood type (optional display field)",
        examples=["O+"],
    )
    hospital: Optional[str] = Field(
        default=None,
        description="Hospital facility name",
        examples=["General Hospital"],
    )
    test_results: Optional[str] = Field(
        default=None,
        description="Laboratory test result indicator",
        examples=["Normal"],
    )

    @model_validator(mode="before")
    @classmethod
    def resolve_field_aliases(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Validate gender if present
            g = data.get("gender")
            if g is not None:
                g_clean = str(g).strip().upper()
                if g_clean not in VALID_GENDERS:
                    raise ValueError(f"Invalid gender '{g}'. Must be one of {sorted(VALID_GENDERS)}")

            # Resolve medical_condition vs primary_diagnosis
            cond = data.get("medical_condition") or data.get("primary_diagnosis")
            if not cond:
                cond = "Other"
            data["medical_condition"] = cond
            data["primary_diagnosis"] = cond

            # Resolve insurance vs insurance_provider
            ins = data.get("insurance_provider") or data.get("insurance")
            data["insurance_provider"] = ins
            data["insurance"] = ins

            # Resolve admission_type default
            if not data.get("admission_type"):
                data["admission_type"] = "Inpatient"
        return data


class PredictionResponse(BaseModel):
    """Response schema for POST /predict."""

    demo_only: bool = Field(
        default=True,
        description="Strict safety flag: result is for demonstration only, not clinical use",
    )
    risk_score: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Demo-calculated risk score between 0.0 and 1.0",
    )
    risk_tier: str = Field(
        ...,
        description="Risk tier: HIGH, MEDIUM, or LOW",
    )
    risk_drivers: List[RiskDriver] = Field(
        default_factory=list,
        description="Plain-language contributing factors explaining the demo score",
    )
    confidence: ConfidenceInfo = Field(
        ...,
        description="Confidence indicators and data completeness warnings",
    )
    confidence_warnings: List[str] = Field(
        default_factory=list,
        description="Warning flags list for backward compatibility",
    )
