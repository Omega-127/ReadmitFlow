"""Common schema models, enums, and base response types."""

from typing import List, Literal
from pydantic import BaseModel, Field

from app.core.safety import DATA_NOTICE

# Risk tier type
RiskTier = Literal["low", "medium", "high"]

# Confidence level type
ConfidenceLevel = Literal["high", "review", "low"]


class RiskDriver(BaseModel):
    """Explainable factor contributing to a patient's risk score."""

    label: str = Field(..., description="Plain-language description of the driver")
    direction: Literal["increases", "decreases", "review"] = Field(
        ..., description="How this factor influences risk direction"
    )
    summary: str = Field(..., description="Detailed explanation of the factor")


class ConfidenceInfo(BaseModel):
    """Data quality and confidence indicators for clinical decision support."""

    level: str = Field(
        default="review", description="Confidence level: high, review, or low"
    )
    summary: str = Field(
        ..., description="Plain-language explanation of data completeness"
    )
    flags: List[str] = Field(
        default_factory=list, description="Specific warnings or missing context flags"
    )


class BaseSafetyResponse(BaseModel):
    """Base response model including safety disclaimers."""

    demo_only: bool = Field(
        default=True, description="Indicates this response is strictly demo-only"
    )
    data_notice: str = Field(
        default=DATA_NOTICE, description="Synthetic data safety notice"
    )
