"""Prediction endpoint router (POST /predict)."""

from fastapi import APIRouter

from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.services.prediction_service import prediction_service

router = APIRouter(tags=["Prediction"])


@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Evaluate manual synthetic patient risk",
    description=(
        "Validates manual patient inputs and generates a demo-only risk score, "
        "tier classification, plain-language risk drivers, and confidence guard flags. "
        "Strictly non-diagnostic."
    ),
)
def predict(payload: PredictionRequest) -> PredictionResponse:
    """Processes manual patient characteristics and returns a demo risk result.

    Returns HTTP 422 automatically if required fields are missing or invalid
    (e.g., age outside 0-120 or negative billing amounts).
    """
    return prediction_service.predict_risk(payload)
