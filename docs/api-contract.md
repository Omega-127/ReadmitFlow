# ReadmitFlow API Contract

**Base URL:** `http://localhost:8000` locally, or the Render service URL when deployed.  
**Data classification:** synthetic demo data only.  
**Safety rule:** all prediction responses include `demo_only: true` until an organizer-approved readmission target and model are available.

## Common response fields

| Field | Type | Meaning |
| --- | --- | --- |
| `demo_only` | boolean | Indicates that results are not clinical predictions. |
| `data_notice` | string | Synthetic-data and decision-support warning for UI display. |
| `generated_at` | ISO 8601 datetime | Time that the response was prepared. |

## `GET /health`

Returns basic service status for deployment checks.

```json
{
  "status": "ok",
  "demo_only": true,
  "model_status": "demo-data",
  "generated_at": "2026-09-20T10:00:00Z"
}
```

## `GET /patients`

Returns a prioritized, paginated list of synthetic patients.

### Query parameters

| Name | Type | Required | Rules |
| --- | --- | --- | --- |
| `query` | string | No | Searches display name or identifier. |
| `risk_tier` | `low`, `medium`, `high` | No | Filters by displayed tier. |
| `limit` | integer | No | Default `25`; minimum `1`; maximum `100`. |

### Response

```json
{
  "demo_only": true,
  "data_notice": "Synthetic demo data. Not for diagnosis or autonomous clinical decisions.",
  "patients": [
    {
      "id": "PT-1001",
      "display_name": "Patient PT-1001",
      "age": 67,
      "medical_condition": "Diabetes",
      "admission_type": "Urgent",
      "risk_score": 0.78,
      "risk_tier": "high",
      "confidence_level": "review",
      "assigned_action_status": "pending"
    }
  ]
}
```

## `GET /patients/{patient_id}`

Returns one synthetic patient with explanation and action-template data.

### Success response

```json
{
  "demo_only": true,
  "data_notice": "Synthetic demo data. Not for diagnosis or autonomous clinical decisions.",
  "patient": {
    "id": "PT-1001",
    "display_name": "Patient PT-1001",
    "age": 67,
    "gender": "Female",
    "medical_condition": "Diabetes",
    "admission_type": "Urgent",
    "risk_score": 0.78,
    "risk_tier": "high",
    "risk_drivers": [
      {
        "label": "Urgent admission context",
        "direction": "increases",
        "summary": "This available admission field contributed to the demo score."
      }
    ],
    "confidence": {
      "level": "review",
      "summary": "One or more fields need review before relying on this score.",
      "flags": ["Incomplete discharge-context field"]
    },
    "recommendation_templates": [
      "Care-coordinator follow-up call",
      "Medication reconciliation review",
      "Specialist-review request"
    ]
  }
}
```

### Errors

| Status | Meaning |
| --- | --- |
| `404` | No patient matches `patient_id`. |
| `500` | Demo data or model artifact could not be loaded. |

## `POST /predict`

Validates manual synthetic input and returns a **demo-only** risk result. This endpoint must not accept real patient information.

### Request body

```json
{
  "age": 67,
  "gender": "Female",
  "medical_condition": "Diabetes",
  "admission_type": "Urgent",
  "insurance_provider": "Medicare",
  "billing_amount": 18000.0,
  "medication": "Example medication"
}
```

### Validation rules

- `age` must be an integer from `0` to `120`.
- Categorical values must be within the configured synthetic-data vocabulary.
- `billing_amount`, if supplied, must be zero or greater.
- Required fields missing from the request return `422`.
- API errors must never expose input values in server logs or response messages.

### Response

```json
{
  "demo_only": true,
  "risk_score": 0.63,
  "risk_tier": "medium",
  "risk_drivers": [
    {
      "label": "Available demographic and admission fields",
      "direction": "review",
      "summary": "Demo-only explanation generated from the approved synthetic model."
    }
  ],
  "confidence": {
    "level": "review",
    "summary": "This result is not a clinical prediction.",
    "flags": []
  }
}
```

## `GET /metrics`

Returns precomputed model evaluation information and the safety/assumption text that appears in the Model and Safety page.

```json
{
  "demo_only": true,
  "metrics": {
    "roc_auc": 0.0,
    "precision": 0.0,
    "recall": 0.0,
    "f1": 0.0,
    "confusion_matrix": [[0, 0], [0, 0]]
  },
  "preprocessing_summary": [
    "Synthetic dataset validation completed",
    "Model results require an approved readmission target"
  ],
  "limitations": [
    "Not for diagnosis, treatment, or autonomous clinical decisions",
    "Synthetic data does not establish clinical validity"
  ]
}
```

When no organizer-approved target exists, values must be clearly labelled as demonstration placeholders instead of being represented as clinical model performance.
