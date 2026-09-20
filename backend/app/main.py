"""Main FastAPI application for ReadmitFlow.

Configures application lifespan, CORS middleware, router registration,
and top-level safety attributes.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.core.safety import DATA_NOTICE
from app.routers import (
    health_router,
    metrics_router,
    patients_router,
    predictions_router,
)

# Initialize FastAPI application with project metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=settings.DESCRIPTION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure Cross-Origin Resource Sharing (CORS) for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
app.include_router(health_router)
app.include_router(patients_router)
app.include_router(predictions_router)
app.include_router(metrics_router)


@app.get("/", tags=["Root"])
def root_status() -> dict:
    """Root entry point providing service information and safety boundaries."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_only": settings.DEMO_ONLY,
        "data_notice": DATA_NOTICE,
        "docs_url": "/docs",
    }
