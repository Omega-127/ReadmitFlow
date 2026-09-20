# ReadmitFlow API Contract

**Base URL:** `http://localhost:8000` locally, or the Render service URL when deployed.  
**Data classification:** synthetic demo data only.  
**Safety rule:** all prediction responses include `demo_only: true` until an organizer-approved readmission target and model are available.

## Common response fields

| Field | Type | Meaning |
| --- | --- | --- |
| `demo_only` | boolean | Indicates that results are not clinical predictions. |
| `data_notice` | string | Synthetic-data and decision-support warning for UI display. |
| `generated_at` | ISO 8601 datetime | Time that the response was prepared (health endpoint only). |

## `GET /`

Returns root service information and safety boundaries.

```json
{
  "service": "ReadmitFlow API",
  "version": "0.1.0",
  "demo_only": true,
  "data_notice": "Synthetic demo data only. Not for diagnosis or autonomous clinical decisions.",
  "docs_url": "/docs"
}
```

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
| `query` | string | No | Searches patient ID, display name, or medical condition. |
| `search` | string | No | Alias for `query` (takes precedence if both provided). |
| `risk_tier` | `low`, `medium`, `high` | No | Filters by displayed tier. |
| `tier` | `low`, `medium`, `high` | No | Alias for `risk_tier` (takes precedence if both provided). |
| `limit` | integer | No | Default `25`; minimum `1`; maximum `100`. |

### Response

```json
{
  "demo_only": true,
  "data_notice": "Synthetic demo data. Not for diagnosis or autonomous clinical decisions.",
  "patients": [
    {
      "id": "PAT-0001",
      "display_name": "Patient PAT-0001",
      "age": 72,
      "gender": "Female",
      "blood_type": "O+",
      "medical_condition": "Heart Failure",
      "admission_date": "2026-09-08",
      "admission_type": "Emergency",
      "discharge_date": "2026-09-15",
      "hospital": "Metropolitan General Hospital",
      "insurance_provider": "Medicare",
      "billing_amount": 24500.0,
      "medication": "Furosemide",
      "test_results": "Abnormal",
      "risk_score": 0.88,
      "risk_tier": "high",
      "confidence_level": "review",
      "confidence_flags": ["Post-discharge context review recommended"],
      "confidence": {
        "level": "review",
        "summary": "Demographic and admission data complete; discharge summary requires clinical validation.",
        "flags": ["Post-discharge context review recommended"]
      },
      "risk_drivers": [
        {
          "label": "Emergency admission with cardiac condition",
          "direction": "increases",
          "summary": "Emergency admission for heart failure is heavily associated with elevated post-discharge risk in demo models."
        }
      ],
      "recommendation_templates": [
        "Care-coordinator 48-hour follow-up call",
        "Medication reconciliation review"
      ],
      "assigned_action_status": "pending"
    }
  ],
  "total": 1
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
    "id": "PAT-0001",
    "display_name": "Patient PAT-0001",
    "age": 72,
    "gender": "Female",
    "blood_type": "O+",
    "medical_condition": "Heart Failure",
    "admission_date": "2026-09-08",
    "admission_type": "Emergency",
    "discharge_date": "2026-09-15",
    "hospital": "Metropolitan General Hospital",
    "insurance_provider": "Medicare",
    "billing_amount": 24500.0,
    "medication": "Furosemide",
    "test_results": "Abnormal",
    "risk_score": 0.88,
    "risk_tier": "high",
    "risk_drivers": [
      {
        "label": "Emergency admission with cardiac condition",
        "direction": "increases",
        "summary": "Emergency admission for heart failure is heavily associated with elevated post-discharge risk in demo models."
      },
      {
        "label": "Advanced age (>70)",
        "direction": "increases",
        "summary": "Elderly patient demographic increases care coordination requirements."
      }
    ],
    "confidence": {
      "level": "review",
      "summary": "Demographic and admission data complete; discharge summary requires clinical validation.",
      "flags": ["Post-discharge context review recommended"]
    },
    "recommendation_templates": [
      "Care-coordinator 48-hour follow-up call",
      "Medication reconciliation review",
      "Cardiology specialist consultation"
    ],
    "assigned_action_status": "pending",
    "admission_count": 0,
    "days_since_last_admission": 90,
    "has_pcp": true,
    "missing_fields": [],
    "data_notice": "Synthetic demo data only. Not for diagnosis or autonomous clinical decisions."
  }
}
```

### Errors

| Status | Meaning |
| --- | --- |
| `404` | No patient matches `patient_id`. |
| `500` | Demo data or model artifact could not be loaded. |

## `POST /predict`

Validates manual synthetic input and returns a **demo-only** risk result. This endpoint must not accept real patient information. The backend uses a rule-based heuristic scoring model (`model_service.py`) that generates transparent, explainable risk drivers.

### Request body

```json
{
  "age": 67,
  "gender": "Female",
  "medical_condition": "Diabetes",
  "admission_type": "Urgent",
  "insurance_provider": "Medicare",
  "billing_amount": 18000.0,
  "medication": "Example medication",
  "test_results": "Normal"
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
  "risk_tier": "MEDIUM",
  "risk_drivers": [
    {
      "label": "Urgent admission context",
      "direction": "increases",
      "summary": "Urgent presentation indicates acute symptom escalation requiring timely care coordinator follow-up."
    },
    {
      "label": "Chronic metabolic condition (Diabetes)",
      "direction": "increases",
      "summary": "Glycemic management and post-discharge medication stability require follow-up support."
    }
  ],
  "confidence": {
    "level": "review",
    "summary": "One or more secondary fields need review before relying on this score.",
    "flags": ["Missing discharge medication field"]
  }
}
```

### Scoring heuristics

The demo model evaluates the following factors with additive weights:
- **Admission type**: Emergency (+0.28), Urgent (+0.20), Elective (−0.08)
- **Medical condition**: Heart Failure (+0.25), Diabetes (+0.15), Hypertension (+0.10), Asthma/Respiratory (+0.08)
- **Age**: 75+ (+0.16), 65–74 (+0.10), <35 (−0.06)
- **Prior admissions**: +0.07 per prior admission (capped at +0.35)
- **Recency**: <30 days since last admission (+0.15)
- **No PCP recorded**: +0.12
- **Test results**: Abnormal (+0.12), Normal (−0.05)

Final score is clamped to [0.05, 0.95].

## `GET /metrics`

Returns precomputed model evaluation information and the safety/assumption text that appears in the Model and Safety page.

```json
{
  "demo_only": true,
  "roc_auc": 0.72,
  "precision": 0.31,
  "recall": 0.68,
  "f1": 0.43,
  "confusion_matrix": {
    "true_positive": 372,
    "false_positive": 826,
    "true_negative": 3282,
    "false_negative": 174
  },
  "test_samples": 4654,
  "preprocessing_summary": [
    "Synthea COVID-19 10K CSV encounters processed",
    "30-day inpatient readmission label derived from encounter timelines"
  ],
  "limitations": [
    "Not for diagnosis, treatment, or autonomous clinical decisions",
    "Synthetic data does not establish clinical validity"
  ]
}
```

The frontend normalizes the backend's flat confusion matrix into the `[[TN, FP], [FN, TP]]` array format expected by the UI.

When no organizer-approved target exists, values must be clearly labelled as demonstration placeholders instead of being represented as clinical model performance.

## Frontend fallback behavior

The frontend API client (`lib/api.ts`) implements graceful fallback:
- Each API call has an 8-second timeout (accounts for Render cold starts).
- If the backend is unreachable or returns an error, built-in mock patients with high-fidelity synthetic data are used.
- The `isMock` flag in each API response indicates whether the data came from the backend or the local fallback.
- The frontend handles both envelope (`{ patients: [...] }`) and legacy raw-list (`[...]`) response shapes.
