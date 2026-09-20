# ReadmitFlow Data Dictionary

## Data policy

ReadmitFlow uses **synthetic or organizer-approved de-identified data only**. Do not commit raw real-patient data, credentials, or personally identifying records.

The organizer-specified Healthcare Dataset appears to include patient demographics, admission details, hospital details, billing, medication, and test-result data. It may not include a valid readmission outcome label. The application must therefore separate source fields from any approved model target.

## Patient fields

| Field | Type | Source / use | Notes |
| --- | --- | --- | --- |
| `id` | string | Generated identifier | Use synthetic IDs such as `PT-1001`; never expose real names. |
| `display_name` | string | UI-only label | Use `Patient PT-1001` in the prototype. |
| `age` | integer | Dataset field | Validate from `0` to `120`. |
| `gender` | categorical string | Dataset field | Use only values present in the approved source. |
| `blood_type` | categorical string | Dataset field | Optional display field; not required for the demo model. |
| `medical_condition` | categorical string | Dataset field | Example: Diabetes, Hypertension, Asthma. |
| `admission_date` | ISO date | Dataset field | Used only for synthetic demo context. |
| `admission_type` | categorical string | Dataset field | Example: Emergency, Elective, Urgent. |
| `discharge_date` | ISO date | Dataset field | Enables display of a synthetic length of stay if appropriate. |
| `hospital` | categorical string | Dataset field | Do not claim hospital-level clinical performance. |
| `insurance_provider` | categorical string | Dataset field | Use carefully; do not use for unsupported eligibility decisions. |
| `billing_amount` | number | Dataset field | Informational/demo feature only unless an approved model supports it. |
| `medication` | categorical string | Dataset field | Display context only; never generate prescribing advice. |
| `test_results` | categorical string | Dataset field | Do not present as a readmission label. |

## Derived display fields

| Field | Type | Meaning |
| --- | --- | --- |
| `risk_score` | decimal 0 to 1 | Demo or approved-model score. Must display `demo_only` status. |
| `risk_tier` | `low`, `medium`, `high` | UI grouping of the score; thresholds must be documented in the model metadata. |
| `risk_drivers` | array | Plain-language explanation items; show only model-supported factors. |
| `confidence_level` | `high`, `review`, `low` | Indicates data completeness and similarity to known demo data. It is not a clinical certainty measure. |
| `confidence_flags` | array of strings | Missing, invalid, or weak-context input warnings. |
| `recommendation_templates` | array of strings | Human-reviewed workflow templates, never treatment instructions. |

## Workflow fields stored locally

These records are stored in browser local storage for the demo. They are not sent to the FastAPI service.

| Entity | Field | Type | Meaning |
| --- | --- | --- | --- |
| Action | `patient_id` | string | Synthetic patient associated with the follow-up action. |
| Action | `action_type` | string | Example: follow-up call or medication-reconciliation review. |
| Action | `owner` | string | Demo staff role or team member. |
| Action | `due_date` | ISO date | Target completion date. |
| Action | `status` | `pending`, `in_progress`, `completed` | Current workflow state. |
| Override | `previous_tier` | string | Original displayed risk tier. |
| Override | `selected_tier` | string | Human-selected priority tier. |
| Override | `reason` | string | Required explanation for a human override. |
| Override | `timestamp` | ISO datetime | When the override was recorded. |
| Capacity | `follow_up_call_slots` | integer | Available daily demo slots. |
| Capacity | `specialist_review_slots` | integer | Available daily demo slots. |
| Audit event | `event_type` | string | Action assigned, action completed, override recorded, or capacity allocated. |
| Audit event | `details` | string | Human-readable summary for the patient review timeline. |

## Target-label governance

| Situation | Product behavior |
| --- | --- |
| No approved readmission target | Do not train or claim a real readmission model. Mark all scores and metrics as **Demo Only**. |
| Organizer approves a proxy label | Document the exact rule, limitations, class balance, and why the label is only a proxy. |
| Organizer approves supplementary labelled data | Document source, schema mapping, split strategy, evaluation metrics, and relationship to the required dataset. |
| Approved genuine readmission target | Train only after leakage checks and export model metadata with thresholds and limitations. |

## Data handling checklist

- [ ] Raw CSV files are ignored by Git.
- [ ] Demo data has generated patient IDs and no names.
- [ ] Scores carry the `demo_only` status until approved otherwise.
- [ ] Test-results fields are never misrepresented as readmission outcomes.
- [ ] The app includes no diagnosis, medication, or treatment recommendation logic.
