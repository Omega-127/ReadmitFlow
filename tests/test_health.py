"""
Tests for GET /health

Verifies that the health endpoint:
- Returns 200 OK
- Reports service health and model/demo status
- Includes demo_only flag (required by safety boundary)
- Does not expose sensitive configuration
"""

import pytest


class TestHealthEndpoint:
    """GET /health — service liveness and readiness checks."""

    def test_health_returns_200(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_response_is_json(self, client):
        response = client.get("/health")
        assert response.headers["content-type"].startswith("application/json")

    def test_health_contains_status_field(self, client):
        response = client.get("/health")
        data = response.json()
        assert "status" in data, "Health response must include a 'status' field"

    def test_health_status_is_ok(self, client):
        response = client.get("/health")
        data = response.json()
        assert data["status"] in ("ok", "healthy"), (
            f"Unexpected status value: {data['status']!r}"
        )

    def test_health_includes_demo_only_flag(self, client):
        """
        Safety boundary requirement: every API response surface that touches
        predictions must surface demo_only. The health endpoint documents the
        service-wide demo posture.
        """
        response = client.get("/health")
        data = response.json()
        assert "demo_only" in data, (
            "Health response must include 'demo_only' to communicate safety posture"
        )
        assert data["demo_only"] is True

    def test_health_includes_model_status(self, client):
        """
        The health response should indicate whether the model artifact is loaded,
        so operators can detect deployment issues without inspecting logs.
        """
        response = client.get("/health")
        data = response.json()
        assert "model_loaded" in data or "model_status" in data, (
            "Health response should report model artifact status"
        )

    def test_health_does_not_expose_env_secrets(self, client):
        """
        The health payload must not leak raw environment variable values,
        file paths with credentials, or internal service URLs.
        """
        response = client.get("/health")
        body = response.text.lower()
        forbidden_terms = ["password", "secret", "token", "api_key"]
        for term in forbidden_terms:
            assert term not in body, (
                f"Health endpoint should not expose sensitive term: {term!r}"
            )

    def test_health_no_auth_required(self, client):
        """
        The health endpoint must be publicly accessible for deployment
        health checks (Render, load balancers) without authentication.
        """
        # No auth headers — must still return 200
        response = client.get("/health")
        assert response.status_code == 200
