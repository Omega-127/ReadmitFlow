# ReadmitFlow Judge Demo Script

**Duration:** 3 to 5 minutes  
**Audience:** Hackathon judges  
**Goal:** Demonstrate a complete, human-controlled path from risk review to trackable follow-up action with shift handoff export.

> ReadmitFlow uses synthetic data only. The prototype is clinical decision support, not a diagnostic or treatment tool.

## Before the demo

- Open the hosted application and the local fallback in separate browser tabs.
- Confirm the FastAPI health endpoint is available (or rely on the frontend's built-in mock fallback).
- Use the **Reset Demo** control so the audit trail and capacity counters start in the seeded state.
- Preselect one high-risk synthetic patient with at least one confidence or data-quality flag.
- Keep the Model and Safety page ready in another tab.
- **Optional:** Use the **Judge Scenarios** panel on the Command Center to select a guided scenario — the scenario coach overlay will walk you through each step.

## Pre-built judge scenarios

Five guided scenarios are available from the Command Center sidebar. Each one resets demo state and coaches you through a specific flow:

| Scenario | Duration | Spotlight patient |
| --- | --- | --- |
| High-risk triage | ~2 min | PT-1002 (heart failure) |
| Override & audit | ~90 sec | PT-1003 (low risk → override) |
| Capacity crunch | ~90 sec | PT-1002 (tight slots) |
| Score a live case | ~75 sec | (create new patient) |
| Model honesty | ~60 sec | (none — Model page) |

## Demo flow

### 1. Problem and promise — 20 seconds

> "Hospitals may have patient information, but a prediction score by itself does not ensure the right follow-up happens. ReadmitFlow helps a coordinator identify higher-priority patients, understand the supporting factors, and assign a staff-reviewed action."

Show the synthetic-data and decision-support banner.

### 2. Command Center — 40 seconds

1. Open the **Command Center**.
2. Point out the total synthetic patient count, risk-tier distribution, and available follow-up capacity.
3. Filter the queue to **High** risk and use search or sorting to show that the worklist is actionable.
4. Open the selected high-risk patient.

> "The queue prioritizes who should be reviewed, but it does not make the final care decision."

### 3. Patient Review — 75 seconds

1. Show the patient's risk tier and score.
2. Explain the plain-language drivers, such as admission context, prior utilization, or data fields available in the approved demo model.
3. Show the **Prediction Confidence / Data Quality** guard.
4. Select a follow-up template such as a care-coordinator call or medication-reconciliation review.
5. Assign an owner and due date.

> "The system makes its evidence and uncertainty visible before staff act. A clinician or care coordinator remains responsible for approving every action."

### 4. Human override and auditability — 35 seconds

1. Change the action priority or decline a recommendation.
2. Enter a clear override reason.
3. Show the timestamped audit event.

> "ReadmitFlow avoids black-box automation: every change is attributable to a person and a reason."

### 5. Shift Handoff Export — 25 seconds

1. Click **Handoff** on the Patient Review page.
2. Preview the structured summary (patient info, risk, drivers, actions, activity).
3. Download a PDF (or TXT/CSV) — show it opening.

> "The next coordinator gets a packet — not just a number. Every handoff includes the safety notice."

### 6. Capacity Planner — 35 seconds

1. Open the **Care Capacity Planner**.
2. Set a small daily limit, for example three follow-up calls and two specialist-review slots.
3. Allocate the selected patient to an available slot.
4. Show the remaining capacity and demonstrate that the limit cannot be exceeded.

> "The product supports practical prioritization when care resources are limited; it does not claim that an intervention automatically changes clinical risk."

### 7. Score a Live Patient (optional) — 30 seconds

1. Return to the Command Center and click **Score patient**.
2. Enter demo fields: age 78, Emergency, Heart Failure, Medicare.
3. Click **Score & open** — the new patient lands in the queue with a risk score and drivers.

> "This is not a static list — we can score a new synthetic case live."

### 8. Model and Safety — 35 seconds

1. Open the **Model and Safety** page.
2. Show the model's validation metrics, preprocessing summary, and limitations.
3. Reiterate that the data is synthetic and risk scores are **Demo Only** until organizers approve a valid readmission target strategy.

> "We treat this as decision support, not diagnosis. The user sees limitations in the product, not only in the slides."

### 9. Close — 15 seconds

> "ReadmitFlow is different because it closes the loop: from a risk signal, to an explained and confidence-aware review, to a human-approved action with accountable follow-up and a structured handoff."

## Likely judge questions

| Question | Recommended answer |
| --- | --- |
| Why not make recommendations automatic? | Clinical decisions require human review. The prototype supports prioritization and workflow, not autonomous care. |
| How are patient actions stored? | Demo workflow state is stored locally in the browser for reliability and is resettable. A production version would use secure, role-based persistence. |
| Does the model predict true readmissions? | Only after a valid organizer-approved readmission target is available. Until then, visible scores are marked Demo Only. |
| What makes the project different? | Confidence-aware review, human override/auditability, capacity-aware follow-up allocation, and structured shift handoff turn analytics into a trackable workflow. |
| Can this use real hospital data? | Not in this prototype. Real deployment would require approved data governance, privacy controls, clinical validation, and workflow integration. |
| What if the backend goes down? | The frontend includes rich mock patients and works fully offline — the demo always works. The `isMock` flag lets you detect fallback mode. |
| How does handoff work? | One-click export of patient context, risk, actions, and audit trail as TXT, CSV, or PDF. Every export includes the safety/demo-only notice. |

## Fallback plan

1. If the hosted frontend fails, use the local frontend connected to the local FastAPI service.
2. If the API is unavailable, the frontend automatically falls back to built-in mock patients — the demo continues seamlessly.
3. If Docker is available, run `docker compose up --build` for a self-contained local demo.
4. If time is limited, demonstrate Command Center → Patient Review → Action/Audit → Handoff → Model and Safety. The Capacity Planner and live scoring are optional features.
