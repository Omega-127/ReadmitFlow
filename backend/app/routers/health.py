"""Health check endpoint router."""

from fastapi import APIRouter

from app.schemas.metrics import HealthResponse
from app.services.metrics_service import metrics_service

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service health and demo status",
    description="Returns the service operational status, demo runtime flag, and model readiness.",
)
def get_health() -> HealthResponse:
    """Returns basic service status for health checks and deployment monitoring."""
    return metrics_service.get_health()
