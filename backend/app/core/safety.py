"""Safety boundaries, non-diagnostic disclaimers, and tier calculation rules.

ReadmitFlow is an educational clinical decision-support prototype.
All risk calculations must visibly state they are demo-only.
"""

from typing import List

# Universal data notice displayed on all API surfaces
DATA_NOTICE: str = "Synthetic demo data. Not for diagnosis or autonomous clinical decisions."

# Model prediction safety notice
PREDICTION_NOTICE: str = "This result is not a clinical prediction. Generated for demonstration purposes only."

# Default recommendation templates for human care coordinator review
DEFAULT_RECOMMENDATION_TEMPLATES: List[str] = [
    "Care-coordinator follow-up call",
    "Medication reconciliation review",
    "Specialist-review request",
]

# Risk tier boundaries
HIGH_RISK_THRESHOLD: float = 0.70
MEDIUM_RISK_THRESHOLD: float = 0.40


def get_risk_tier(risk_score: float) -> str:
    """Classifies numeric risk score into low, medium, or high tier.

    Args:
        risk_score: Float between 0.0 and 1.0.

    Returns:
        Risk tier string: 'high', 'medium', or 'low'.
    """
    if risk_score >= HIGH_RISK_THRESHOLD:
        return "high"
    elif risk_score >= MEDIUM_RISK_THRESHOLD:
        return "medium"
    return "low"
