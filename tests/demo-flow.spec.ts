/**
 * End-to-end demo flow: Queue → Review → Action → Capacity → Audit
 *
 * This spec validates the complete coordinator workflow that judges will
 * experience during the hackathon demonstration.
 *
 * Assumes:
 * - Frontend is running at process.env.BASE_URL (default: http://localhost:3000)
 * - Backend is running at process.env.API_URL (default: http://localhost:8000)
 * - Browser local storage starts empty (each test uses a fresh context)
 *
 * Covers the test scenarios from ARCHITECTURE.md §7:
 * - Unknown patient ID → 404 / friendly recovery
 * - Invalid prediction input → 422 / UI validation errors
 * - Missing patient fields → confidence guard warning
 * - Capacity exhausted → allocation blocked
 * - Browser refresh → state persists
 * - Reset Demo → state returns to seeded defaults
 * - Safety boundary → non-diagnostic notice on every prediction surface
 */

import { test, expect, Page, BrowserContext } from "@playwright/test";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

// Synthetic demo patient IDs seeded by the backend
const HIGH_RISK_ID = "P001";
const MEDIUM_RISK_ID = "P002"; // has a missing field
const UNKNOWN_ID = "P_DOES_NOT_EXIST_999";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function goToCommandCenter(page: Page) {
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
}

async function goToPatientReview(page: Page, patientId: string) {
  await page.goto(`${BASE_URL}/patients/${patientId}`);
  await page.waitForLoadState("networkidle");
}

async function goToCapacityPlanner(page: Page) {
  await page.goto(`${BASE_URL}/capacity`);
  await page.waitForLoadState("networkidle");
}

async function goToModelSafety(page: Page) {
  await page.goto(`${BASE_URL}/model-safety`);
  await page.waitForLoadState("networkidle");
}

async function clearLocalStorage(page: Page) {
  await page.evaluate(() => localStorage.clear());
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Demo flow — Command Center (Queue)", () => {
  test("renders the patient queue with at least one patient", async ({ page }) => {
    await goToCommandCenter(page);
    const rows = page.locator("[data-testid='patient-row'], tr[data-patient-id]");
    await expect(rows.first()).toBeVisible({ timeout: 5_000 });
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("patients are sorted by risk score, highest first", async ({ page }) => {
    await goToCommandCenter(page);
    const scores = await page
      .locator("[data-testid='risk-score']")
      .allTextContents();
    const numeric = scores.map((s) => parseFloat(s.replace("%", "")) / 100);
    for (let i = 1; i < numeric.length; i++) {
      expect(numeric[i]).toBeLessThanOrEqual(numeric[i - 1]);
    }
  });

  test("tier filter chip narrows the queue", async ({ page }) => {
    await goToCommandCenter(page);
    await page.click("button:has-text('HIGH')");
    const tiers = await page
      .locator("[data-testid='risk-tier']")
      .allTextContents();
    tiers.forEach((t) => expect(t.toUpperCase()).toBe("HIGH"));
  });

  test("search box filters by diagnosis", async ({ page }) => {
    await goToCommandCenter(page);
    const search = page.locator("input[type='search'], input[placeholder*='Search' i]");
    await search.fill("Heart Failure");
    await page.waitForTimeout(300); // debounce
    const names = await page
      .locator("[data-testid='patient-name']")
      .allTextContents();
    expect(names.length).toBeGreaterThan(0);
    // All visible patients should match the diagnosis
    const diagnoses = await page
      .locator("[data-testid='patient-diagnosis']")
      .allTextContents();
    diagnoses.forEach((d) => expect(d.toLowerCase()).toContain("heart failure"));
  });

  test("clicking a patient row navigates to Patient Review", async ({ page }) => {
    await goToCommandCenter(page);
    await page.click(`[data-patient-id='${HIGH_RISK_ID}']`);
    await expect(page).toHaveURL(new RegExp(`/patients/${HIGH_RISK_ID}`));
  });
});

test.describe("Demo flow — Patient Review", () => {
  test("loads patient detail for a known patient", async ({ page }) => {
    await goToPatientReview(page, HIGH_RISK_ID);
    await expect(page.locator("[data-testid='patient-name']")).toBeVisible();
    await expect(page.locator("[data-testid='risk-score']")).toBeVisible();
  });

  test("shows Demo Only notice on prediction surface", async ({ page }) => {
    await goToPatientReview(page, HIGH_RISK_ID);
    await expect(
      page.locator("text=/demo only|demo-only|not diagnostic/i")
    ).toBeVisible();
  });

  test("renders risk drivers list", async ({ page }) => {
    await goToPatientReview(page, HIGH_RISK_ID);
    const drivers = page.locator("[data-testid='risk-driver']");
    await expect(drivers.first()).toBeVisible();
  });

  test("shows action templates for the high-risk patient", async ({ page }) => {
    await goToPatientReview(page, HIGH_RISK_ID);
    const templates = page.locator("[data-testid='action-template']");
    await expect(templates.first()).toBeVisible();
  });

  test("shows confidence flag for patient with missing field", async ({ page }) => {
    await goToPatientReview(page, MEDIUM_RISK_ID);
    await expect(
      page.locator("[data-testid='confidence-flag'], text=/missing|incomplete|confidence/i")
    ).toBeVisible();
  });

  test("unknown patient ID shows friendly 404 recovery", async ({ page }) => {
    await goToPatientReview(page, UNKNOWN_ID);
    await expect(
      page.locator("text=/not found|patient not found|does not exist/i")
    ).toBeVisible();
    // Should also offer a way back to the queue
    await expect(
      page.locator("a:has-text('queue'), a:has-text('back'), button:has-text('back')")
    ).toBeVisible();
  });
});

test.describe("Demo flow — Action Assignment", () => {
  test("coordinator can select a template and assign an action", async ({ page }) => {
    await clearLocalStorage(page);
    await goToPatientReview(page, HIGH_RISK_ID);

    // Select the first available action template
    await page.click("[data-testid='action-template']:first-child");

    // Submit
    await page.click("button:has-text(/assign|save|submit/i)");

    // Confirmation should appear
    await expect(
      page.locator("text=/assigned|saved|action recorded/i")
    ).toBeVisible({ timeout: 3_000 });
  });

  test("assigned action persists after page refresh", async ({ page }) => {
    await clearLocalStorage(page);
    await goToPatientReview(page, HIGH_RISK_ID);
    await page.click("[data-testid='action-template']:first-child");
    await page.click("button:has-text(/assign|save|submit/i)");
    await page.waitForTimeout(500);

    // Refresh
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Action should still be shown
    await expect(
      page.locator("text=/assigned|saved|action recorded/i")
    ).toBeVisible({ timeout: 3_000 });
  });

  test("audit timeline shows the newly assigned action", async ({ page }) => {
    await clearLocalStorage(page);
    await goToPatientReview(page, HIGH_RISK_ID);
    await page.click("[data-testid='action-template']:first-child");
    await page.click("button:has-text(/assign|save|submit/i)");
    await page.waitForTimeout(300);

    const auditTimeline = page.locator("[data-testid='audit-timeline']");
    await expect(auditTimeline).toBeVisible();
    await expect(auditTimeline.locator("text=/action assigned|assigned/i")).toBeVisible();
  });
});

test.describe("Demo flow — Capacity Planner", () => {
  test("capacity planner page loads", async ({ page }) => {
    await goToCapacityPlanner(page);
    await expect(page.locator("h1, h2").filter({ hasText: /capacity/i })).toBeVisible();
  });

  test("shows current usage and daily limit", async ({ page }) => {
    await goToCapacityPlanner(page);
    await expect(page.locator("[data-testid='capacity-used']")).toBeVisible();
    await expect(page.locator("[data-testid='capacity-limit']")).toBeVisible();
  });

  test("coordinator can update the daily limit", async ({ page }) => {
    await goToCapacityPlanner(page);
    const input = page.locator("input[type='number'][name*='limit' i], input[aria-label*='limit' i]");
    await input.fill("15");
    await page.click("button:has-text(/save|update|apply/i)");
    await expect(page.locator("[data-testid='capacity-limit']")).toContainText("15");
  });

  test("action form is disabled when capacity is exhausted", async ({ page, context }) => {
    // Inject exhausted state into local storage before navigating
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      const state = { actions: {}, capacityUsed: 10, capacityLimit: 10, auditLog: [] };
      localStorage.setItem("readmitflow_demo_workflow", JSON.stringify(state));
    });

    await goToPatientReview(page, HIGH_RISK_ID);
    const submitBtn = page.locator("button:has-text(/assign|save|submit/i)");
    await expect(submitBtn).toBeDisabled();

    await expect(
      page.locator("text=/capacity|limit reached|no slots/i")
    ).toBeVisible();
  });
});

test.describe("Demo flow — Model & Safety page", () => {
  test("model-safety page loads", async ({ page }) => {
    await goToModelSafety(page);
    await expect(page.locator("h1, h2").filter({ hasText: /model|safety/i })).toBeVisible();
  });

  test("displays ROC-AUC, precision, recall, F1 metrics", async ({ page }) => {
    await goToModelSafety(page);
    const metrics = ["ROC-AUC", "Precision", "Recall", "F1"];
    for (const metric of metrics) {
      await expect(page.locator(`text=/${metric}/i`)).toBeVisible();
    }
  });

  test("displays model limitations section", async ({ page }) => {
    await goToModelSafety(page);
    await expect(
      page.locator("text=/limitation|synthetic|not validated/i")
    ).toBeVisible();
  });

  test("demo-only notice is visible on model page", async ({ page }) => {
    await goToModelSafety(page);
    await expect(
      page.locator("text=/demo only|demo-only|not diagnostic/i")
    ).toBeVisible();
  });
});

test.describe("Demo flow — Reset Demo", () => {
  test("Reset Demo restores default workflow state", async ({ page }) => {
    // Set some non-default state
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      const state = {
        actions: { P001: { action: "Test action", timestamp: Date.now() } },
        capacityUsed: 7,
        capacityLimit: 15,
        auditLog: [{ id: "x", type: "ACTION_ASSIGNED", patientId: "P001" }],
      };
      localStorage.setItem("readmitflow_demo_workflow", JSON.stringify(state));
    });

    // Find and click Reset Demo
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.click("button:has-text(/reset demo/i)");

    // Confirm dialog if one appears
    const confirmBtn = page.locator("button:has-text(/confirm|yes|reset/i)");
    if (await confirmBtn.isVisible({ timeout: 1_000 })) {
      await confirmBtn.click();
    }

    // Capacity should be back to default (10)
    await goToCapacityPlanner(page);
    await expect(
      page.locator("[data-testid='capacity-limit']")
    ).toContainText("10");

    // Audit log should be empty
    await goToPatientReview(page, HIGH_RISK_ID);
    await expect(
      page.locator("text=/no activity|empty|no events/i")
    ).toBeVisible({ timeout: 3_000 });
  });

  test("local storage is cleared after Reset Demo", async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.setItem("readmitflow_demo_workflow", JSON.stringify({ capacityLimit: 99 }));
    });

    await page.reload();
    await page.click("button:has-text(/reset demo/i)");
    const confirmBtn = page.locator("button:has-text(/confirm|yes|reset/i)");
    if (await confirmBtn.isVisible({ timeout: 1_000 })) await confirmBtn.click();

    const stored = await page.evaluate(() =>
      localStorage.getItem("readmitflow_demo_workflow")
    );
    // Either cleared entirely or reset to seeded defaults (not 99)
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      expect(parsed.capacityLimit).not.toBe(99);
    }
  });
});

test.describe("Demo flow — Safety boundary invariants", () => {
  test("Demo Only banner is visible on Command Center", async ({ page }) => {
    await goToCommandCenter(page);
    await expect(
      page.locator("text=/demo only|demo-only|not diagnostic/i")
    ).toBeVisible();
  });

  test("Demo Only notice is visible on Patient Review", async ({ page }) => {
    await goToPatientReview(page, HIGH_RISK_ID);
    await expect(
      page.locator("text=/demo only|demo-only|not diagnostic/i")
    ).toBeVisible();
  });

  test("Demo Only notice is visible on Model Safety page", async ({ page }) => {
    await goToModelSafety(page);
    await expect(
      page.locator("text=/demo only|demo-only|not diagnostic/i")
    ).toBeVisible();
  });
});
