"""Prediction service for handling manual patient risk assessments.

Coordinates model inference and response formatting for the POST /predict endpoint.
Ensures outputs strictly adhere to demo safety boundaries.
"""

from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.model_service import model_service


class PredictionService:
    """Service handling manual prediction processing."""

    def __init__(self) -> None:
        self.model = model_service

    def predict_risk(self, request: PredictionRequest) -> PredictionResponse:
        """Processes manual patient inputs and returns a demo risk evaluation.

        Args:
            request: Validated manual patient characteristics.

        Returns:
            PredictionResponse with risk score, tier, drivers, and confidence guard.
        """
        # Execute prediction via the isolated model layer
        prediction_result = self.model.predict(request)

        # Structure into typed Pydantic response
        return PredictionResponse(
            demo_only=True,
            risk_score=prediction_result["risk_score"],
            risk_tier=prediction_result["risk_tier"],
            risk_drivers=prediction_result["risk_drivers"],
            confidence=prediction_result["confidence"],
            confidence_warnings=prediction_result["confidence"].flags,
        )


# Singleton instance of PredictionService
prediction_service = PredictionService()
