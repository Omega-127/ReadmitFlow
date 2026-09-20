"""
Tests for GET /patients and GET /patients/{id}

Covers:
- Listing all synthetic patients
- Filtering by tier and search query
- Pagination via limit parameter
- Full patient profile retrieval
- Risk drivers and confidence flags shape
- 404 for unknown patient IDs
- demo_only safety label on every response
"""

import pytest


class TestListPatients:
    """GET /patients — patient queue listing."""

    def test_list_returns_200(self, client):
        response = client.get("/patients")
        assert response.status_code == 200

    def test_list_returns_list(self, client):
        data = client.get("/patients").json()
        assert isinstance(data, list), "Expected a JSON array at the top level"

    def test_list_patients_have_required_fields(self, client):
        """
        Each patient record in the list must have the fields the Command Center
        queue and filters depend on.
        """
        required = {"id", "risk_score", "risk_tier", "primary_diagnosis", "demo_only"}
        data = client.get("/patients").json()
        for patient in data:
            missing = required - patient.keys()
            assert not missing, f"Patient {patient.get('id')} missing fields: {missing}"

    def test_list_demo_only_is_true_for_all(self, client):
        """Safety boundary: every record must be marked demo_only."""
        data = client.get("/patients").json()
        for patient in data:
            assert patient["demo_only"] is True, (
                f"Patient {patient.get('id')} does not have demo_only=True"
            )

    def test_list_patients_sorted_by_risk_score_descending(self, client):
        """
        The queue should present highest-risk patients first so coordinators
        can triage immediately.
        """
        data = client.get("/patients").json()
        scores = [p["risk_score"] for p in data]
        assert scores == sorted(scores, reverse=True), (
            "Patients should be sorted by risk_score descending"
        )

    def test_list_risk_scores_in_valid_range(self, client):
        data = client.get("/patients").json()
        for patient in data:
            score = patient["risk_score"]
            assert 0.0 <= score <= 1.0, (
                f"risk_score {score} for patient {patient.get('id')} is out of [0, 1]"
            )

    def test_list_risk_tiers_are_valid_values(self, client):
        valid_tiers = {"HIGH", "MEDIUM", "LOW"}
        data = client.get("/patients").json()
        for patient in data:
            assert patient["risk_tier"] in valid_tiers, (
                f"Unexpected tier {patient['risk_tier']!r} for patient {patient.get('id')}"
            )

    # ------------------------------------------------------------------
    # Filtering
    # ------------------------------------------------------------------

    def test_filter_by_tier_high(self, client):
        data = client.get("/patients", params={"tier": "HIGH"}).json()
        for patient in data:
            assert patient["risk_tier"] == "HIGH"

    def test_filter_by_tier_medium(self, client):
        data = client.get("/patients", params={"tier": "MEDIUM"}).json()
        for patient in data:
            assert patient["risk_tier"] == "MEDIUM"

    def test_filter_by_tier_low(self, client):
        data = client.get("/patients", params={"tier": "LOW"}).json()
        for patient in data:
            assert patient["risk_tier"] == "LOW"

    def test_filter_by_unknown_tier_returns_empty_or_400(self, client):
        """
        An invalid tier value should either return an empty list (lenient)
        or a 400 validation error (strict). Both are acceptable.
        """
        response = client.get("/patients", params={"tier": "CRITICAL"})
        assert response.status_code in (200, 400, 422)
        if response.status_code == 200:
            assert response.json() == []

    def test_search_by_diagnosis_keyword(self, client):
        """Search should match patient records by primary_diagnosis substring."""
        response = client.get("/patients", params={"search": "Heart Failure"})
        assert response.status_code == 200
        data = response.json()
        for patient in data:
            assert "heart failure" in patient.get("primary_diagnosis", "").lower()

    def test_search_with_no_matches_returns_empty_list(self, client):
        response = client.get("/patients", params={"search": "ZZZNOMATCH99"})
        assert response.status_code == 200
        assert response.json() == []

    def test_limit_parameter_caps_result_count(self, client):
        limit = 1
        data = client.get("/patients", params={"limit": limit}).json()
        assert len(data) <= limit

    def test_limit_zero_returns_empty_or_400(self, client):
        response = client.get("/patients", params={"limit": 0})
        assert response.status_code in (200, 400, 422)
        if response.status_code == 200:
            assert response.json() == []

    def test_limit_negative_returns_400_or_422(self, client):
        response = client.get("/patients", params={"limit": -5})
        assert response.status_code in (400, 422)


class TestGetPatientDetail:
    """GET /patients/{id} — full patient profile."""

    def test_valid_id_returns_200(self, client, high_risk_patient):
        pid = high_risk_patient["id"]
        response = client.get(f"/patients/{pid}")
        assert response.status_code == 200

    def test_unknown_id_returns_404(self, client):
        response = client.get("/patients/DOES_NOT_EXIST_XYZ")
        assert response.status_code == 404

    def test_404_response_has_detail_field(self, client):
        """FastAPI convention: 404 responses include a 'detail' field."""
        response = client.get("/patients/DOES_NOT_EXIST_XYZ")
        data = response.json()
        assert "detail" in data

    def test_detail_has_required_profile_fields(self, client, high_risk_patient):
        pid = high_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        required = {
            "id",
            "name",
            "age",
            "risk_score",
            "risk_tier",
            "primary_diagnosis",
            "risk_drivers",
            "confidence_flags",
            "action_templates",
            "demo_only",
        }
        missing = required - data.keys()
        assert not missing, f"Patient detail missing fields: {missing}"

    def test_detail_demo_only_is_true(self, client, high_risk_patient):
        pid = high_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        assert data["demo_only"] is True

    def test_detail_risk_drivers_is_list(self, client, high_risk_patient):
        pid = high_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        assert isinstance(data["risk_drivers"], list)

    def test_detail_risk_driver_shape(self, client, high_risk_patient):
        """Each risk driver must have factor, direction, and weight."""
        pid = high_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        for driver in data["risk_drivers"]:
            assert "factor" in driver
            assert "direction" in driver
            assert driver["direction"] in ("increases", "decreases")
            assert "weight" in driver
            assert isinstance(driver["weight"], float)

    def test_detail_confidence_flags_is_list(self, client, high_risk_patient):
        pid = high_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        assert isinstance(data["confidence_flags"], list)

    def test_detail_missing_fields_surface_as_confidence_flags(
        self, client, medium_risk_patient
    ):
        """
        The medium-risk demo patient has a missing 'insurance' field.
        The API should surface this as a confidence flag.
        """
        pid = medium_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        assert len(data["confidence_flags"]) > 0, (
            "Patient with missing fields should have at least one confidence flag"
        )

    def test_detail_action_templates_is_list(self, client, high_risk_patient):
        pid = high_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        assert isinstance(data["action_templates"], list)
        assert len(data["action_templates"]) > 0, (
            "High-risk patient should have at least one action template"
        )

    def test_detail_age_is_positive_integer(self, client, high_risk_patient):
        pid = high_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        assert isinstance(data["age"], int)
        assert data["age"] > 0

    def test_detail_risk_score_in_valid_range(self, client, high_risk_patient):
        pid = high_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        assert 0.0 <= data["risk_score"] <= 1.0

    def test_detail_id_matches_requested(self, client, high_risk_patient):
        pid = high_risk_patient["id"]
        data = client.get(f"/patients/{pid}").json()
        assert data["id"] == pid
