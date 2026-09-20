"""
Tests for GET /metrics

Covers:
- Payload completeness (all required metric fields present)
- Metric values are in sane ranges
- Confusion matrix structure and consistency
- Limitations array is non-empty (honest model documentation)
- demo_only flag is present
- No auth required (public transparency endpoint)
"""

import pytest


EXPECTED_METRIC_KEYS = {
    "model_type",
    "demo_only",
    "roc_auc",
    "precision",
    "recall",
    "f1",
    "confusion_matrix",
    "limitations",
}

EXPECTED_CONFUSION_MATRIX_KEYS = {
    "true_positive",
    "false_positive",
    "false_negative",
    "true_negative",
}


class TestMetricsEndpoint:
    """GET /metrics — model evaluation payload."""

    def test_metrics_returns_200(self, client):
        response = client.get("/metrics")
        assert response.status_code == 200

    def test_metrics_response_is_json(self, client):
        response = client.get("/metrics")
        assert response.headers["content-type"].startswith("application/json")

    def test_metrics_has_all_required_keys(self, client):
        data = client.get("/metrics").json()
        missing = EXPECTED_METRIC_KEYS - data.keys()
        assert not missing, f"Metrics payload is missing keys: {missing}"

    # ------------------------------------------------------------------
    # demo_only safety label
    # ------------------------------------------------------------------

    def test_metrics_demo_only_is_true(self, client):
        data = client.get("/metrics").json()
        assert data["demo_only"] is True

    # ------------------------------------------------------------------
    # Metric value sanity checks
    # ------------------------------------------------------------------

    @pytest.mark.parametrize("metric", ["roc_auc", "precision", "recall", "f1"])
    def test_metric_is_float_in_range(self, client, metric):
        data = client.get("/metrics").json()
        value = data[metric]
        assert isinstance(value, float), f"{metric} should be a float, got {type(value)}"
        assert 0.0 <= value <= 1.0, f"{metric} = {value} is outside [0, 1]"

    def test_roc_auc_is_above_random(self, client):
        """
        A model with ROC-AUC <= 0.5 performs at or below random chance.
        Demo data should produce a meaningful baseline.
        """
        data = client.get("/metrics").json()
        assert data["roc_auc"] > 0.5, (
            f"ROC-AUC {data['roc_auc']} suggests the model is no better than random"
        )

    def test_f1_is_harmonic_mean_consistent(self, client):
        """
        F1 must be consistent with the reported precision and recall.
        Allow a tolerance of 0.02 for rounding.
        """
        data = client.get("/metrics").json()
        p = data["precision"]
        r = data["recall"]
        reported_f1 = data["f1"]
        if p + r > 0:
            expected_f1 = 2 * (p * r) / (p + r)
            assert abs(reported_f1 - expected_f1) < 0.02, (
                f"F1={reported_f1:.3f} is inconsistent with P={p:.3f}, R={r:.3f}. "
                f"Expected ~{expected_f1:.3f}"
            )

    # ------------------------------------------------------------------
    # Confusion matrix
    # ------------------------------------------------------------------

    def test_confusion_matrix_has_required_keys(self, client):
        data = client.get("/metrics").json()
        cm = data["confusion_matrix"]
        assert isinstance(cm, dict), "confusion_matrix should be an object"
        missing = EXPECTED_CONFUSION_MATRIX_KEYS - cm.keys()
        assert not missing, f"Confusion matrix missing keys: {missing}"

    def test_confusion_matrix_values_are_non_negative_integers(self, client):
        data = client.get("/metrics").json()
        cm = data["confusion_matrix"]
        for key in EXPECTED_CONFUSION_MATRIX_KEYS:
            assert isinstance(cm[key], int), f"cm[{key!r}] should be int"
            assert cm[key] >= 0, f"cm[{key!r}] = {cm[key]} is negative"

    def test_confusion_matrix_totals_are_plausible(self, client):
        """
        Total samples in the confusion matrix should be a reasonable size
        for a synthetic demo dataset (at least 100, not absurdly large).
        """
        data = client.get("/metrics").json()
        cm = data["confusion_matrix"]
        total = sum(cm[k] for k in EXPECTED_CONFUSION_MATRIX_KEYS)
        assert 100 <= total <= 10_000, (
            f"Confusion matrix total {total} is outside the plausible demo range"
        )

    def test_confusion_matrix_precision_consistency(self, client):
        """
        Precision computed from confusion matrix values should roughly match
        the reported precision metric.
        """
        data = client.get("/metrics").json()
        cm = data["confusion_matrix"]
        tp = cm["true_positive"]
        fp = cm["false_positive"]
        reported_precision = data["precision"]
        if tp + fp > 0:
            computed_precision = tp / (tp + fp)
            assert abs(computed_precision - reported_precision) < 0.05, (
                f"Computed precision {computed_precision:.3f} diverges from "
                f"reported {reported_precision:.3f}"
            )

    def test_confusion_matrix_recall_consistency(self, client):
        data = client.get("/metrics").json()
        cm = data["confusion_matrix"]
        tp = cm["true_positive"]
        fn = cm["false_negative"]
        reported_recall = data["recall"]
        if tp + fn > 0:
            computed_recall = tp / (tp + fn)
            assert abs(computed_recall - reported_recall) < 0.05, (
                f"Computed recall {computed_recall:.3f} diverges from "
                f"reported {reported_recall:.3f}"
            )

    # ------------------------------------------------------------------
    # Limitations — honest documentation required
    # ------------------------------------------------------------------

    def test_limitations_is_non_empty_list(self, client):
        """
        The limitations field is a mandatory transparency requirement.
        An empty list means the model is being presented without caveats,
        which violates the project's safety boundary.
        """
        data = client.get("/metrics").json()
        limitations = data["limitations"]
        assert isinstance(limitations, list)
        assert len(limitations) > 0, (
            "limitations must contain at least one entry — omitting limitations "
            "violates the project safety boundary"
        )

    def test_limitations_are_non_empty_strings(self, client):
        data = client.get("/metrics").json()
        for i, item in enumerate(data["limitations"]):
            assert isinstance(item, str), f"limitations[{i}] should be a string"
            assert len(item.strip()) > 0, f"limitations[{i}] is an empty string"

    def test_model_type_is_string(self, client):
        data = client.get("/metrics").json()
        assert isinstance(data["model_type"], str)
        assert len(data["model_type"].strip()) > 0

    # ------------------------------------------------------------------
    # Optional fields that should be present for full transparency
    # ------------------------------------------------------------------

    def test_preprocessing_summary_present(self, client):
        data = client.get("/metrics").json()
        assert "preprocessing_summary" in data, (
            "preprocessing_summary should be included for model transparency"
        )

    def test_training_and_test_sample_counts_present(self, client):
        data = client.get("/metrics").json()
        for key in ("training_samples", "test_samples"):
            assert key in data, f"'{key}' should be included in metrics payload"
            assert isinstance(data[key], int)
            assert data[key] > 0

    def test_no_auth_required(self, client):
        """Metrics endpoint is a public transparency surface — no auth."""
        response = client.get("/metrics")
        assert response.status_code == 200
