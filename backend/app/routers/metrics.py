"""Model metrics and evaluation endpoint router (GET /metrics)."""

from fastapi import APIRouter

from app.schemas.metrics import MetricsResponse
from app.services.metrics_service import metrics_service

router = APIRouter(tags=["Metrics"])


@router.get(
    "/metrics",
    response_model=MetricsResponse,
    summary="Model evaluation metrics and limitations",
    description=(
        "Returns precomputed evaluation metrics (ROC-AUC, Precision, Recall, F1, "
        "confusion matrix), data preprocessing summary notes, and documented "
        "clinical decision-support limitations."
    ),
)
def get_metrics() -> MetricsResponse:
    """Returns baseline model evaluation metrics and safety limitations."""
    return metrics_service.get_metrics()
