"""Model service providing demo-only prediction heuristics and explainability.

Isolates model inference and explainable scoring from API route handlers.
Strictly non-diagnostic: all generated risk scores are demonstrative placeholders.
"""

from typing import Any, Dict, List

from app.core.safety import get_risk_tier
from app.schemas.common import ConfidenceInfo, RiskDriver
from app.schemas.prediction import PredictionRequest


class ModelService:
    """Service simulating clinical decision support prediction for demo workflows."""

    def predict(self, request: PredictionRequest) -> Dict[str, Any]:
        """Calculates a transparent demo risk score and plain-language drivers.

        Args:
            request: Validated manual patient characteristics.

        Returns:
            Dictionary containing demo risk_score, risk_tier, risk_drivers, and confidence.
        """
        # Baseline risk weight
        score = 0.20
        drivers: List[RiskDriver] = []
        flags: List[str] = []

        # 1. Acuity & Admission Type impact
        adm_type = request.admission_type.strip().title()
        if adm_type == "Emergency":
            score += 0.28
            drivers.append(
                RiskDriver(
                    label="Emergency admission acuity",
                    direction="increases",
                    summary="Unscheduled emergency admission significantly increases post-discharge monitoring need in demo models.",
                )
            )
        elif adm_type == "Urgent":
            score += 0.20
            drivers.append(
                RiskDriver(
                    label="Urgent admission context",
                    direction="increases",
                    summary="Urgent presentation indicates acute symptom escalation requiring timely care coordinator follow-up.",
                )
            )
        elif adm_type == "Elective":
            score -= 0.08
            drivers.append(
                RiskDriver(
                    label="Elective admission type",
                    direction="decreases",
                    summary="Planned elective admissions generally correlate with planned recovery pathways.",
                )
            )

        # 2. Medical Condition impact
        cond = request.medical_condition.strip().lower()
        if "heart failure" in cond or "cardiac" in cond:
            score += 0.25
            drivers.append(
                RiskDriver(
                    label="Cardiovascular condition complexity",
                    direction="increases",
                    summary="Heart failure is a primary clinical driver of 30-day post-discharge readmission.",
                )
            )
        elif "diabetes" in cond:
            score += 0.15
            drivers.append(
                RiskDriver(
                    label="Chronic metabolic condition (Diabetes)",
                    direction="increases",
                    summary="Glycemic management and post-discharge medication stability require follow-up support.",
                )
            )
        elif "hypertension" in cond:
            score += 0.10
            drivers.append(
                RiskDriver(
                    label="Vascular risk factor (Hypertension)",
                    direction="increases",
                    summary="Underlying cardiovascular risk factor contributing to baseline vulnerability.",
                )
            )
        elif "asthma" in cond or "respiratory" in cond:
            score += 0.08
            drivers.append(
                RiskDriver(
                    label="Respiratory condition factor",
                    direction="increases",
                    summary="Respiratory vulnerability highlights importance of outpatient inhaler/medication adherence.",
                )
            )

        # 3. Demographic: Age impact
        if request.age >= 75:
            score += 0.16
            drivers.append(
                RiskDriver(
                    label="Advanced senior demographic (75+)",
                    direction="increases",
                    summary="High age bracket associated with increased post-discharge frailty and coordination barriers.",
                )
            )
        elif request.age >= 65:
            score += 0.10
            drivers.append(
                RiskDriver(
                    label="Senior demographic (65-74)",
                    direction="increases",
                    summary="Elderly demographic status increases recommended follow-up priority.",
                )
            )
        elif request.age < 35:
            score -= 0.06
            drivers.append(
                RiskDriver(
                    label="Younger age cohort (<35)",
                    direction="decreases",
                    summary="Younger demographic generally correlates with fewer baseline chronic complications.",
                )
            )

        # 4. Lab / Test Result indicators
        if request.test_results:
            tr = request.test_results.strip().lower()
            if "abnormal" in tr:
                score += 0.12
                drivers.append(
                    RiskDriver(
                        label="Abnormal lab findings",
                        direction="increases",
                        summary="Documented abnormal diagnostic results suggest ongoing physiologic instability.",
                    )
                )
            elif "normal" in tr:
                score -= 0.05
                drivers.append(
                    RiskDriver(
                        label="Normal laboratory profile",
                        direction="decreases",
                        summary="Normal diagnostic markers mitigate immediate post-discharge concern.",
                    )
                )

        # 5. Data completeness check for Confidence Guard
        if not request.medication:
            flags.append("Missing discharge medication field")
        if not request.test_results:
            flags.append("Missing test results context")
        if not request.billing_amount or request.billing_amount == 0:
            flags.append("Zero or unrecorded billing detail")

        # Determine confidence level based on flags
        if len(flags) >= 2:
            confidence_level = "low"
            confidence_summary = (
                "Multiple recommended clinical context fields are missing or incomplete."
            )
        elif len(flags) == 1:
            confidence_level = "review"
            confidence_summary = (
                "One or more secondary fields need review before relying on this score."
            )
        else:
            confidence_level = "high"
            confidence_summary = (
                "All primary and secondary demo inputs are complete and consistent."
            )

        # Clamp calculated risk score strictly to [0.05, 0.95]
        final_score = round(max(0.05, min(score, 0.95)), 2)
        tier = get_risk_tier(final_score)

        # If no drivers triggered, add a default explanatory item
        if not drivers:
            drivers.append(
                RiskDriver(
                    label="Available demographic and admission fields",
                    direction="review",
                    summary="Demo-only explanation generated from the synthetic heuristic model.",
                )
            )

        return {
            "demo_only": True,
            "risk_score": final_score,
            "risk_tier": tier,
            "risk_drivers": drivers,
            "confidence": ConfidenceInfo(
                level=confidence_level,
                summary=confidence_summary,
                flags=flags,
            ),
        }


# Singleton instance of ModelService
model_service = ModelService()
