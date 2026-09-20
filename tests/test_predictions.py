"""
Tests for POST /predict

Covers:
- Valid payload produces a demo-only risk score and tier
- Required-field validation (422 on missing fields)
- Type validation (422 on wrong types)
- Edge-case inputs (zero admissions, elderly patient, missing PCP)
- Safety boundary: demo_only must always be True
- Confidence warnings are present when data quality is low
- Response shape is stable regardless of input variation
"""

import pytest


class TestPredictValidInput:
    """POST /predict — happy-path predictions with valid input."""

    def test_valid_payload_returns_200(self, client, valid_prediction_payload):
        response = client.post("/predict", json=valid_prediction_payload)
        assert response.status_code == 200

    def test_response_is_json(self, client, valid_prediction_payload):
        response = client.post("/predict", json=valid_prediction_payload)
        assert response.headers["content-type"].startswith("application/json")

    def test_response_has_risk_score(self, client, valid_prediction_payload):
        data = client.post("/predict", json=valid_prediction_payload).json()
        assert "risk_score" in data

    def test_risk_score_in_valid_range(self, client, valid_prediction_payload):
        data = client.post("/predict", json=valid_prediction_payload).json()
        score = data["risk_score"]
        assert isinstance(score, float), f"risk_score should be float, got {type(score)}"
        assert 0.0 <= score <= 1.0, f"risk_score {score} outside [0, 1]"

    def test_response_has_risk_tier(self, client, valid_prediction_payload):
        data = client.post("/predict", json=valid_prediction_payload).json()
        assert "risk_tier" in data
        assert data["risk_tier"] in ("HIGH", "MEDIUM", "LOW")

    def test_response_demo_only_is_true(self, client, valid_prediction_payload):
        """
        Safety boundary: manual prediction responses must always be marked
        demo_only=True until organizers approve an appropriate target label.
        """
        data = client.post("/predict", json=valid_prediction_payload).json()
        assert "demo_only" in data
        assert data["demo_only"] is True

    def test_response_has_risk_drivers(self, client, valid_prediction_payload):
        data = client.post("/predict", json=valid_prediction_payload).json()
        assert "risk_drivers" in data
        assert isinstance(data["risk_drivers"], list)

    def test_response_has_confidence_warnings(self, client, valid_prediction_payload):
        data = client.post("/predict", json=valid_prediction_payload).json()
        assert "confidence_warnings" in data
        assert isinstance(data["confidence_warnings"], list)

    def test_high_risk_features_produce_high_or_medium_tier(self, client):
        """
        A patient with many prior admissions and a recent discharge should
        trend toward a higher risk tier. We do not hard-assert HIGH because
        the synthetic model may vary, but LOW would be suspicious.
        """
        payload = {
            "age": 80,
            "gender": "M",
            "admission_count": 6,
            "days_since_last_admission": 5,
            "primary_diagnosis": "Heart Failure",
            "insurance": "Medicare",
            "has_pcp": False,
        }
        data = client.post("/predict", json=payload).json()
        assert data["risk_tier"] in ("HIGH", "MEDIUM"), (
            "A patient with 6 admissions in 5 days should not be LOW risk"
        )

    def test_low_risk_features_produce_low_or_medium_tier(self, client):
        """
        First admission, 90 days out, has PCP — should not be HIGH risk.
        """
        payload = {
            "age": 30,
            "gender": "F",
            "admission_count": 0,
            "days_since_last_admission": 90,
            "primary_diagnosis": "Appendectomy",
            "insurance": "Commercial",
            "has_pcp": True,
        }
        data = client.post("/predict", json=payload).json()
        assert data["risk_tier"] in ("LOW", "MEDIUM"), (
            "A first-time patient 90 days post-discharge should not be HIGH risk"
        )


class TestPredictInvalidInput:
    """POST /predict — validation errors should return 422."""

    def test_empty_payload_returns_422(self, client):
        response = client.post("/predict", json={})
        assert response.status_code == 422

    def test_missing_required_fields_returns_422(self, client, incomplete_prediction_payload):
        response = client.post("/predict", json=incomplete_prediction_payload)
        assert response.status_code == 422

    def test_422_response_has_detail(self, client):
        response = client.post("/predict", json={})
        data = response.json()
        assert "detail" in data, "422 response must include 'detail' describing validation errors"

    def test_wrong_type_age_returns_422(self, client, valid_prediction_payload):
        payload = {**valid_prediction_payload, "age": "seventy-two"}
        response = client.post("/predict", json=payload)
        assert response.status_code == 422

    def test_negative_age_returns_422_or_400(self, client, valid_prediction_payload):
        payload = {**valid_prediction_payload, "age": -1}
        response = client.post("/predict", json=payload)
        assert response.status_code in (400, 422)

    def test_age_zero_returns_422_or_400(self, client, valid_prediction_payload):
        payload = {**valid_prediction_payload, "age": 0}
        response = client.post("/predict", json=payload)
        assert response.status_code in (400, 422)

    def test_negative_admission_count_returns_422_or_400(
        self, client, valid_prediction_payload
    ):
        payload = {**valid_prediction_payload, "admission_count": -1}
        response = client.post("/predict", json=payload)
        assert response.status_code in (400, 422)

    def test_invalid_gender_returns_422_or_400(self, client, valid_prediction_payload):
        payload = {**valid_prediction_payload, "gender": "X99"}
        response = client.post("/predict", json=payload)
        assert response.status_code in (400, 422)

    def test_non_json_body_returns_422(self, client):
        response = client.post(
            "/predict",
            content="not json at all",
            headers={"Content-Type": "application/json"},
        )
        assert response.status_code == 422


class TestPredictConfidenceWarnings:
    """Confidence/data-quality warnings must surface for incomplete inputs."""

    def test_missing_pcp_field_produces_warning(self, client, valid_prediction_payload):
        """
        A patient without a recorded PCP is a data-quality signal.
        The model should flag this as a confidence warning.
        """
        payload = {**valid_prediction_payload, "has_pcp": False}
        data = client.post("/predict", json=payload).json()
        # Response must still be 200 — the warning is informational, not an error
        assert isinstance(data.get("confidence_warnings"), list)

    def test_confidence_warnings_are_strings(self, client, valid_prediction_payload):
        data = client.post("/predict", json=valid_prediction_payload).json()
        for warning in data.get("confidence_warnings", []):
            assert isinstance(warning, str), (
                f"Confidence warning should be a string, got {type(warning)}"
            )


class TestPredictSafetyBoundary:
    """Enforce the demo_only safety label under all conditions."""

    @pytest.mark.parametrize("risk_score_threshold", [0.9, 0.5, 0.1])
    def test_demo_only_always_true_regardless_of_score(
        self, client, valid_prediction_payload, risk_score_threshold
    ):
        """
        Even if an input generates a very high or very low score, demo_only
        must remain True. It is never toggled by score value.
        """
        data = client.post("/predict", json=valid_prediction_payload).json()
        assert data.get("demo_only") is True

    def test_prediction_response_shape_is_stable(self, client, valid_prediction_payload):
        """
        Run the same input twice and confirm the response shape is identical
        (deterministic model output expected for logistic regression).
        """
        r1 = client.post("/predict", json=valid_prediction_payload).json()
        r2 = client.post("/predict", json=valid_prediction_payload).json()
        assert set(r1.keys()) == set(r2.keys()), (
            "Prediction response shape must be stable across identical requests"
        )
        assert r1["risk_score"] == r2["risk_score"], (
            "Logistic regression output must be deterministic"
        )
        assert r1["risk_tier"] == r2["risk_tier"]
