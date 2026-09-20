# ReadmitFlow Data Dictionary

## Data policy

ReadmitFlow uses **synthetic or organizer-approved de-identified data only**. Do not commit raw real-patient data, credentials, or personally identifying records.

**Primary training source:** Synthea COVID-19 10K CSV sample (`dataset/synthea/`). The 30-day readmission label is **derived** from inpatient encounter timelines (next inpatient within 30 days of discharge). Outputs remain decision-support / demo-only.

The original organizer Healthcare Dataset may still be referenced for context, but it lacks a verified readmission outcome and is not the default training source.

## Patient fields

| Field | Type | Source / use | Notes |
| --- | --- | --- | --- |
| `id` | string | Generated identifier | Use synthetic IDs such as `PAT-0001` (backend) or `PT-1001` (frontend mock). |
| `display_name` | string | UI-only label | Use `Patient PAT-0001` in the prototype. |
| `age` | integer | Dataset field | Validate from `0` to `120`. |
| `gender` | categorical string | Dataset field | Use only values present in the approved source. |
| `blood_type` | categorical string | Dataset field | Optional display field; not required for the demo model. |
| `medical_condition` | categorical string | Dataset field | Example: Diabetes, Hypertension, Asthma, Heart Failure, COPD, Pneumonia. |
| `primary_diagnosis` | categorical string | Backend alias | Same value as `medical_condition`; provided for backward compatibility. |
| `admission_date` | ISO date | Dataset field | Used only for synthetic demo context. |
| `admission_type` | categorical string | Dataset field | Example: Emergency, Elective, Urgent, Inpatient. |
| `discharge_date` | ISO date | Dataset field | Enables display of a synthetic length of stay if appropriate. |
| `hospital` | categorical string | Dataset field | Do not claim hospital-level clinical performance. |
| `insurance_provider` | categorical string | Dataset field | Use carefully; do not use for unsupported eligibility decisions. |
| `insurance` | categorical string | Backend alias | Same value as `insurance_provider`; provided for backward compatibility. |
| `billing_amount` | number | Dataset field | Informational/demo feature only unless an approved model supports it. |
| `medication` | categorical string | Dataset field | Display context only; never generate prescribing advice. |
| `test_results` | categorical string | Dataset field | Do not present as a readmission label. |
| `admission_count` | integer | Backend derived | Number of prior admissions (used in prediction heuristics). |
| `days_since_last_admission` | integer | Backend derived | Days since previous discharge (defaults to 90 if no prior). |
| `has_pcp` | boolean | Backend derived | Whether the patient has a recorded primary care provider. |
| `missing_fields` | array of strings | Backend derived | List of data fields with missing or incomplete values. |

## Derived display fields

| Field | Type | Meaning |
| --- | --- | --- |
| `risk_score` | decimal 0 to 1 | Demo or approved-model score. Must display `demo_only` status. |
| `risk_tier` | `low`, `medium`, `high` | UI grouping of the score; thresholds must be documented in the model metadata. |
| `risk_drivers` | array | Plain-language explanation items; show only model-supported factors. |
| `risk_drivers[].label` | string | Short human-readable name of the contributing factor. |
| `risk_drivers[].direction` | `increases` / `decreases` / `review` | Whether the factor raises or lowers the score. |
| `risk_drivers[].summary` | string | Plain-language explanation of the factor's contribution. |
| `risk_drivers[].feature` | string (optional) | Machine-readable feature identifier (frontend mock only). |
| `risk_drivers[].impact_weight` | number (optional) | Signed weight reflecting relative contribution magnitude. |
| `confidence_level` | `high`, `review`, `low` | Indicates data completeness and similarity to known demo data. It is not a clinical certainty measure. |
| `confidence_flags` | array of strings | Missing, invalid, or weak-context input warnings. |
| `confidence` | object | Structured confidence info with `level`, `summary`, `flags`, and optional `missing_fields`. |
| `recommendation_templates` | array of strings | Human-reviewed workflow templates, never treatment instructions. |
| `action_templates` | array of strings | Backend alias for `recommendation_templates`. |
| `assigned_action_status` | `pending` / `in_progress` / `completed` | Current workflow state from the API. |

## Workflow fields stored locally

These records are stored in browser local storage for the demo. They are not sent to the FastAPI service.

| Entity | Field | Type | Meaning |
| --- | --- | --- | --- |
| Action | `id` | string | Unique action identifier. |
| Action | `patient_id` | string | Synthetic patient associated with the follow-up action. |
| Action | `action_type` | string | Example: follow-up call or medication-reconciliation review. |
| Action | `owner` | string | Demo staff role or team member. |
| Action | `due_date` | ISO date | Target completion date. |
| Action | `status` | `pending`, `in_progress`, `completed` | Current workflow state. |
| Action | `notes` | string (optional) | Free-text notes attached to the action. |
| Action | `created_at` | ISO datetime | When the action was created. |
| Action | `completed_at` | ISO datetime (optional) | When the action was completed. |
| Override | `id` | string | Unique override identifier. |
| Override | `patient_id` | string | Synthetic patient being overridden. |
| Override | `previous_tier` | string | Original displayed risk tier. |
| Override | `selected_tier` | string | Human-selected priority tier. |
| Override | `reason` | string | Required explanation for a human override. |
| Override | `clinician_name` | string | Name/role of the staff member making the override. |
| Override | `timestamp` | ISO datetime | When the override was recorded. |
| Capacity | `follow_up_call_slots` | integer | Available daily demo slots. |
| Capacity | `specialist_review_slots` | integer | Available daily demo slots. |
| Capacity | `rapid_outreach_slots` | integer | Available daily rapid outreach slots. |
| Capacity | `nurse_consult_slots` | integer | Available daily nurse consult slots. |
| Capacity | `last_updated` | ISO datetime | When capacity was last modified. |
| Audit event | `id` | string | Unique event identifier. |
| Audit event | `patient_id` | string (optional) | Associated patient, if applicable. |
| Audit event | `event_type` | string | `action_assigned`, `action_updated`, `override_recorded`, `capacity_allocated`, `demo_reset`, or `triage_reviewed`. |
| Audit event | `details` | string | Human-readable summary for the patient review timeline. |
| Audit event | `actor` | string | Staff name/role who triggered the event. |
| Audit event | `timestamp` | ISO datetime | When the event was recorded. |
| Custom patient | (full Patient object) | object | Patients scored via `POST /predict` and saved to local storage. |

## Shift handoff export

The handoff system (`lib/handoff.ts`) generates exportable summaries for care coordinator transitions. Available formats:

| Format | Function | Description |
| --- | --- | --- |
| Plain text | `buildHandoffText()` | Structured text with sections: patient, risk, override, drivers, actions, recent activity, checklist. |
| CSV | `buildHandoffCsv()` | Section-field-value tabular format for import into spreadsheets. |
| HTML/Print | `buildHandoffHtml()` + `openHandoffPrintWindow()` | Printable HTML page with safety notices. |
| PDF | `downloadHandoffPdf()` | Client-side PDF generation via jsPDF. |

All formats include the demo/synthetic data safety notice.

## Judge demo scenarios

Five pre-built scenarios are available in `lib/scenarios.ts` for structured judge presentations:

| Scenario ID | Title | Duration | Key demo points |
| --- | --- | --- | --- |
| `high-risk-triage` | High-risk triage | ~2 min | Queue → open patient → assign outreach → export handoff |
| `override-audit` | Override & audit | ~90 sec | Override tier → record reason → show audit trail |
| `capacity-crunch` | Capacity crunch | ~90 sec | Tight slot limits → assign under pressure → capacity warnings |
| `score-live` | Score a live synthetic case | ~75 sec | Open Score Patient → submit → review scored patient |
| `model-honesty` | Model honesty | ~60 sec | Metrics → confusion matrix → limitations |

Scenario state is stored in session storage (`readmitflow_active_scenario`). Each scenario can optionally reset demo state and set specific capacity limits on start.

## Target-label governance

| Situation | Product behavior |
| --- | --- |
| No approved readmission target | Do not train or claim a real readmission model. Mark all scores and metrics as **Demo Only**. |
| Organizer approves a proxy label | Document the exact rule, limitations, class balance, and why the label is only a proxy. |
| Organizer approves supplementary labelled data | Document source, schema mapping, split strategy, evaluation metrics, and relationship to the required dataset. |
| Synthea derived 30-day label (current default) | Train on synthetic EHR with documented inpatient-to-inpatient return window; keep **Demo Only** product framing. |
| Approved genuine readmission target | Train only after leakage checks and export model metadata with thresholds and limitations. |

## Data handling checklist

- [x] Raw CSV files are ignored by Git.
- [x] Demo data has generated patient IDs and no names.
- [x] Scores carry the `demo_only` status until approved otherwise.
- [x] Test-results fields are never misrepresented as readmission outcomes.
- [x] The app includes no diagnosis, medication, or treatment recommendation logic.
- [x] Handoff exports include safety/demo-only notices in every format.
