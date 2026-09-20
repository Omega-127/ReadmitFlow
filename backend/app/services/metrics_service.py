"""Metrics service providing model evaluation summaries, limitations, and health checks.

Ensures evaluation metrics are not falsely represented as validated clinical performance.
"""

from datetime import datetime, timezone

from app.repositories.demo_data_repository import demo_data_repo
from app.schemas.metrics import (
    HealthResponse,
    MetricsResponse,
    ModelMetricsData,
)


class MetricsService:
    """Service handling metrics loading and service health status."""

    def __init__(self) -> None:
        self.repo = demo_data_repo

    def get_metrics(self) -> MetricsResponse:
        """Retrieves model evaluation metrics and safety limitations.

        Returns:
            MetricsResponse labeled as demonstration placeholder.
        """
        raw_metrics = self.repo.get_metrics()

        # Parse metrics data safely
        metrics_data = raw_metrics.get("metrics", {})
        roc_auc = float(raw_metrics.get("roc_auc", metrics_data.get("roc_auc", 0.0)))
        precision = float(raw_metrics.get("precision", metrics_data.get("precision", 0.0)))
        recall = float(raw_metrics.get("recall", metrics_data.get("recall", 0.0)))
        f1 = float(raw_metrics.get("f1", metrics_data.get("f1", 0.0)))

        parsed_metrics = ModelMetricsData(
            roc_auc=roc_auc,
            precision=precision,
            recall=recall,
            f1=f1,
            confusion_matrix=metrics_data.get("confusion_matrix", [[0, 0], [0, 0]]),
        )

        cm = raw_metrics.get("confusion_matrix", metrics_data.get("confusion_matrix"))

        return MetricsResponse(
            demo_only=True,
            model_type=raw_metrics.get("model_type", "LogisticRegression"),
            roc_auc=roc_auc,
            precision=precision,
            recall=recall,
            f1=f1,
            confusion_matrix=cm,
            training_samples=raw_metrics.get("training_samples"),
            test_samples=raw_metrics.get("test_samples"),
            metrics=parsed_metrics,
            preprocessing_summary=raw_metrics.get(
                "preprocessing_summary",
                [
                    "Synthetic dataset validation completed",
                    "Baseline demonstration placeholders active pending organizer-approved target",
                ],
            ),
            limitations=raw_metrics.get(
                "limitations",
                [
                    "Demonstration prototype only; not for diagnosis, treatment, or clinical intervention",
                    "Synthetic data does not establish clinical validity",
                ],
            ),
        )

    def get_health(self) -> HealthResponse:
        """Returns API service health, demo mode flag, and model readiness status.

        Returns:
            HealthResponse with current UTC timestamp.
        """
        now_utc = datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")
        return HealthResponse(
            status="ok",
            demo_only=True,
            model_status="demo-data",
            generated_at=now_utc,
        )


# Singleton instance of MetricsService
metrics_service = MetricsService()
