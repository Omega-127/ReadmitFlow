"""Pydantic schemas for model metrics, evaluation summaries, and health checks."""

from typing import List
from pydantic import BaseModel, Field


class ModelMetricsData(BaseModel):
    """Core evaluation metrics structure."""

    roc_auc: float = Field(
        default=0.0, description="Area Under the ROC Curve (demo placeholder)"
    )
    precision: float = Field(
        default=0.0, description="Precision score (demo placeholder)"
    )
    recall: float = Field(
        default=0.0, description="Recall score (demo placeholder)"
    )
    f1: float = Field(
        default=0.0, description="F1 harmonic mean score (demo placeholder)"
    )
    confusion_matrix: List[List[int]] = Field(
        default_factory=lambda: [[0, 0], [0, 0]],
        description="2x2 confusion matrix array",
    )


class MetricsResponse(BaseModel):
    """Response schema for GET /metrics."""

    demo_only: bool = Field(
        default=True,
        description="Safety flag indicating metrics are demonstration placeholders",
    )
    metrics: ModelMetricsData = Field(
        ..., description="Model evaluation performance values"
    )
    preprocessing_summary: List[str] = Field(
        ..., description="Notes regarding data preparation and encoding status"
    )
    limitations: List[str] = Field(
        ..., description="Clinical safety constraints and data boundaries"
    )


class HealthResponse(BaseModel):
    """Response schema for GET /health."""

    status: str = Field(default="ok", description="Service health indicator")
    demo_only: bool = Field(
        default=True, description="Safety flag confirming demo-only runtime mode"
    )
    model_status: str = Field(
        default="demo-data",
        description="Status of underlying model or demo heuristic artifact",
    )
    generated_at: str = Field(
        ..., description="ISO 8601 UTC timestamp of response generation"
    )
