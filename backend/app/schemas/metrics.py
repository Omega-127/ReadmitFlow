"""Pydantic schemas for model metrics, evaluation summaries, and health checks."""

from typing import Dict, List, Optional, Union
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
    model_type: Optional[str] = Field(
        default="LogisticRegression", description="Model architecture type"
    )
    roc_auc: Optional[float] = Field(
        default=0.0, description="Top-level ROC-AUC score"
    )
    precision: Optional[float] = Field(
        default=0.0, description="Top-level Precision score"
    )
    recall: Optional[float] = Field(
        default=0.0, description="Top-level Recall score"
    )
    f1: Optional[float] = Field(
        default=0.0, description="Top-level F1 score"
    )
    confusion_matrix: Optional[Union[Dict[str, int], List[List[int]]]] = Field(
        default=None, description="Confusion matrix dict or 2x2 matrix"
    )
    training_samples: Optional[int] = Field(
        default=None, description="Number of training samples"
    )
    test_samples: Optional[int] = Field(
        default=None, description="Number of test samples"
    )
    metrics: Optional[ModelMetricsData] = Field(
        default=None, description="Model evaluation performance values object"
    )
    preprocessing_summary: List[str] = Field(
        default_factory=list, description="Notes regarding data preparation and encoding status"
    )
    limitations: List[str] = Field(
        default_factory=list, description="Clinical safety constraints and data boundaries"
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
