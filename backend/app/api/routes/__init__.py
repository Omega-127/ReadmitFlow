"""API routes package."""

from app.routers.health import router as health_router
from app.routers.metrics import router as metrics_router
from app.routers.patients import router as patients_router
from app.routers.predictions import router as prediction_router

__all__ = [
    "health_router",
    "metrics_router",
    "patients_router",
    "prediction_router",
]
