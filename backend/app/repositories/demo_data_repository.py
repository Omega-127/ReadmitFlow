"""Demo data repository for accessing synthetic patients and precomputed metrics.

Implements the repository pattern to isolate data access from business services.
Loads from demo JSON files with graceful fallback to in-memory synthetic records.
"""

import json
import logging
from typing import Any, Dict, List, Optional

from app.config import settings
from app.data.synthetic_patients import DEFAULT_METRICS, SYNTHETIC_PATIENTS

logger = logging.getLogger(__name__)


class DemoDataRepository:
    """Repository managing retrieval of synthetic demo data."""

    def __init__(self) -> None:
        self._patients_cache: Optional[List[Dict[str, Any]]] = None
        self._metrics_cache: Optional[Dict[str, Any]] = None

    def get_all_patients(self) -> List[Dict[str, Any]]:
        """Returns the full list of synthetic patient records.

        Attempts to load from demo_patients.json; falls back to in-memory seeds.
        """
        if self._patients_cache is not None:
            return self._patients_cache

        # Attempt to read from JSON file
        if settings.PATIENTS_JSON_PATH.exists():
            try:
                with open(settings.PATIENTS_JSON_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, list) and len(data) > 0:
                        self._patients_cache = data
                        return self._patients_cache
            except Exception as e:
                logger.warning(
                    "Failed to read %s (%s). Falling back to in-memory data.",
                    settings.PATIENTS_JSON_PATH,
                    e,
                )

        # Fallback to in-memory synthetic seed
        self._patients_cache = list(SYNTHETIC_PATIENTS)
        return self._patients_cache

    def get_patient_by_id(self, patient_id: str) -> Optional[Dict[str, Any]]:
        """Finds a single patient record by identifier (case-insensitive).

        Args:
            patient_id: The synthetic identifier (e.g. PAT-0001).

        Returns:
            Patient dictionary if found, or None.
        """
        clean_id = patient_id.strip().upper()
        patients = self.get_all_patients()
        for patient in patients:
            if patient.get("id", "").strip().upper() == clean_id:
                return patient
        return None

    def get_metrics(self) -> Dict[str, Any]:
        """Returns precomputed evaluation metrics and safety limitations.

        Attempts to read from metrics.json; falls back to default in-memory metrics.
        """
        if self._metrics_cache is not None:
            return self._metrics_cache

        # Attempt to read from JSON file
        if settings.METRICS_JSON_PATH.exists():
            try:
                with open(settings.METRICS_JSON_PATH, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    if isinstance(data, dict):
                        self._metrics_cache = data
                        return self._metrics_cache
            except Exception as e:
                logger.warning(
                    "Failed to read %s (%s). Falling back to in-memory metrics.",
                    settings.METRICS_JSON_PATH,
                    e,
                )

        # Fallback to in-memory default metrics
        self._metrics_cache = dict(DEFAULT_METRICS)
        return self._metrics_cache


# Singleton repository instance for application-wide dependency injection
demo_data_repo = DemoDataRepository()
