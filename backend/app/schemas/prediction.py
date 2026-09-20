"""Pydantic schemas for manual patient prediction requests and responses."""

from typing import List, Optional
from pydantic import BaseModel, Field

from app.schemas.common import ConfidenceInfo, RiskDriver


class PredictionRequest(BaseModel):
    """Payload schema for manual synthetic patient risk evaluation (POST /predict)."""

    age: int = Field(
        ...,
        ge=0,
        le=120,
        description="Patient age in years (must be between 0 and 120)",
        examples=[67],
    )
    gender: str = Field(
        ...,
        description="Patient gender (e.g. Female, Male, Other)",
        examples=["Female"],
    )
    medical_condition: str = Field(
        ...,
        description="Primary clinical condition (e.g. Diabetes, Hypertension, Heart Failure)",
        examples=["Diabetes"],
    )
    admission_type: str = Field(
        ...,
        description="Admission type: Emergency, Urgent, or Elective",
        examples=["Urgent"],
    )
    insurance_provider: Optional[str] = Field(
        default=None,
        description="Insurance provider name",
        examples=["Medicare"],
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
        description="Risk tier: high, medium, or low",
    )
    risk_drivers: List[RiskDriver] = Field(
        default_factory=list,
        description="Plain-language contributing factors explaining the demo score",
    )
    confidence: ConfidenceInfo = Field(
        ...,
        description="Confidence indicators and data completeness warnings",
    )
