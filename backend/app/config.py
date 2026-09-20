"""Configuration and environment settings for ReadmitFlow Backend.

This module centralizes application settings, CORS origins, and path configurations.
"""

import os
from pathlib import Path
from typing import List


class Settings:
    """Application configuration settings."""

    # Project metadata
    PROJECT_NAME: str = "ReadmitFlow API"
    VERSION: str = "0.1.0"
    DESCRIPTION: str = (
        "Clinical decision-support prototype backend API using synthetic data. "
        "Strictly for demonstration and educational use; not for clinical diagnosis."
    )

    # Safety boundary: All scores and metrics are marked demo-only
    DEMO_ONLY: bool = os.getenv("DEMO_ONLY", "true").lower() in ("true", "1", "yes")

    # Allowed CORS origins (Next.js frontend default port 3000)
    _raw_origins: str = os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,https://localhost:3000",
    )
    ALLOWED_ORIGINS: List[str] = [
        origin.strip() for origin in _raw_origins.split(",") if origin.strip()
    ]

    # File paths for static demo data
    BACKEND_DIR: Path = Path(__file__).resolve().parent.parent
    DATA_DIR: Path = BACKEND_DIR / "data"
    PATIENTS_JSON_PATH: Path = DATA_DIR / "demo_patients.json"
    METRICS_JSON_PATH: Path = DATA_DIR / "metrics.json"


settings = Settings()
