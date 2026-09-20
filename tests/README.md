# ReadmitFlow — Tests

This directory contains all automated tests for the ReadmitFlow hackathon prototype.

```
tests/
├── backend/          pytest — FastAPI endpoint tests
├── frontend/         Vitest + RTL — React component tests
└── e2e/              Playwright — full demo-flow tests
```

---

## Backend (pytest)

### Setup

```bash
cd backend
pip install -r requirements.txt
pip install pytest pytest-asyncio httpx

# Run all backend tests
pytest tests/backend/ -v

# Run only safety-boundary tests
pytest tests/backend/ -m safety -v

# Run with coverage
pytest tests/backend/ --cov=app --cov-report=term-missing
```

### What's covered

| File | Scope |
|---|---|
| `test_health.py` | `GET /health` — liveness, demo_only flag, no secret leakage |
| `test_patients.py` | `GET /patients` listing, filters, `GET /patients/{id}` detail + 404 |
| `test_predictions.py` | `POST /predict` valid payloads, 422 validation, safety labels |
| `test_metrics.py` | `GET /metrics` completeness, value sanity, limitations non-empty |

---

## Frontend (Vitest + React Testing Library)

### Setup

```bash
cd frontend
npm install
npm install -D vitest @vitejs/plugin-react @testing-library/react \
               @testing-library/user-event @testing-library/jest-dom jsdom

# Run all frontend tests
npx vitest run tests/frontend/

# Watch mode during development
npx vitest tests/frontend/

# Coverage report
npx vitest run tests/frontend/ --coverage
```

### What's covered

| File | Scope |
|---|---|
| `patient-queue.test.tsx` | Sorting, tier filter chips, search, row navigation |
| `action-form.test.tsx` | Template selection, validation, persistence, capacity lock |
| `capacity.test.tsx` | Settings display, limit update, allocation board, Reset Demo |
| `audit-timeline.test.tsx` | Event ordering, override reasons, persistence across refresh |

---

## E2E (Playwright)

### Setup

```bash
# Install Playwright and browsers
npm install -D @playwright/test
npx playwright install chromium

# Start the frontend and backend dev servers first, then:
npx playwright test tests/e2e/ --config tests/e2e/playwright.config.ts

# Run headed for debugging
npx playwright test tests/e2e/ --headed

# Show HTML report after a run
npx playwright show-report tests/e2e/playwright-report
```

### What's covered

The `demo-flow.spec.ts` exercises every scenario from ARCHITECTURE.md §7:

| Scenario | Test group |
|---|---|
| Queue sorting and filtering | `Command Center (Queue)` |
| Patient detail and risk drivers | `Patient Review` |
| Unknown patient → 404 recovery | `Patient Review` |
| Missing fields → confidence guard | `Patient Review` |
| Action assignment and persistence | `Action Assignment` |
| Capacity exhausted → form disabled | `Capacity Planner` |
| State survives browser refresh | `Action Assignment` |
| Reset Demo restores defaults | `Reset Demo` |
| Demo Only visible on every surface | `Safety boundary invariants` |

---

## Running everything

```bash
# 1. Backend
pytest tests/backend/ -v

# 2. Frontend
npx vitest run tests/frontend/

# 3. E2E (requires both servers running)
npx playwright test tests/e2e/ --config tests/e2e/playwright.config.ts
```

> **Safety note:** All tests operate exclusively on synthetic demo data. No real patient records, PHI, or live clinical systems are involved.
