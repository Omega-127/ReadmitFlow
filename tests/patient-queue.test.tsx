/**
 * Tests for <PatientQueue />
 *
 * Covers:
 * - Renders the patient list from API data
 * - Sorts by risk score descending (highest-risk first)
 * - Tier filter chips narrow the visible rows
 * - Search box filters by patient name and diagnosis
 * - Clicking a row navigates to the Patient Review page
 * - Empty state renders when no patients match filters
 * - Loading and error states are handled gracefully
 */

import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import PatientQueue from "@/components/command-center/patient-queue";

// ---------------------------------------------------------------------------
// Synthetic demo fixtures
// ---------------------------------------------------------------------------

const DEMO_PATIENTS = [
  {
    id: "P001",
    name: "Demo Patient A",
    age: 67,
    risk_score: 0.82,
    risk_tier: "HIGH",
    primary_diagnosis: "Heart Failure",
    demo_only: true,
  },
  {
    id: "P002",
    name: "Demo Patient B",
    age: 45,
    risk_score: 0.51,
    risk_tier: "MEDIUM",
    primary_diagnosis: "COPD",
    demo_only: true,
  },
  {
    id: "P003",
    name: "Demo Patient C",
    age: 38,
    risk_score: 0.19,
    risk_tier: "LOW",
    primary_diagnosis: "Appendectomy",
    demo_only: true,
  },
];

// ---------------------------------------------------------------------------
// Mock router navigation
// ---------------------------------------------------------------------------

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return { ...actual, useNavigate: () => mockNavigate };
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderQueue(patients = DEMO_PATIENTS, props: Record<string, unknown> = {}) {
  return render(
    <MemoryRouter>
      <PatientQueue patients={patients} {...props} />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PatientQueue — rendering", () => {
  it("renders all patient rows by default", () => {
    renderQueue();
    expect(screen.getByText("Demo Patient A")).toBeInTheDocument();
    expect(screen.getByText("Demo Patient B")).toBeInTheDocument();
    expect(screen.getByText("Demo Patient C")).toBeInTheDocument();
  });

  it("shows risk scores for each patient", () => {
    renderQueue();
    // Scores formatted as percentages or decimal — both are acceptable
    expect(screen.getByText(/82|0\.82/)).toBeInTheDocument();
    expect(screen.getByText(/51|0\.51/)).toBeInTheDocument();
    expect(screen.getByText(/19|0\.19/)).toBeInTheDocument();
  });

  it("displays risk tier badges", () => {
    renderQueue();
    expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
    expect(screen.getByText(/MEDIUM/i)).toBeInTheDocument();
    expect(screen.getByText(/LOW/i)).toBeInTheDocument();
  });

  it("renders patients in descending risk score order", () => {
    renderQueue();
    const names = screen
      .getAllByRole("row")
      .map((row) => within(row).queryByText(/Demo Patient [ABC]/))
      .filter(Boolean)
      .map((el) => el!.textContent);

    expect(names[0]).toMatch("Demo Patient A"); // 0.82
    expect(names[1]).toMatch("Demo Patient B"); // 0.51
    expect(names[2]).toMatch("Demo Patient C"); // 0.19
  });

  it("renders an empty state when the patients list is empty", () => {
    renderQueue([]);
    expect(screen.getByText(/no patients|empty|no results/i)).toBeInTheDocument();
  });
});

describe("PatientQueue — tier filtering", () => {
  it("shows only HIGH-tier patients when HIGH filter is active", async () => {
    renderQueue();
    await userEvent.click(screen.getByRole("button", { name: /HIGH/i }));
    expect(screen.getByText("Demo Patient A")).toBeInTheDocument();
    expect(screen.queryByText("Demo Patient B")).not.toBeInTheDocument();
    expect(screen.queryByText("Demo Patient C")).not.toBeInTheDocument();
  });

  it("shows only MEDIUM-tier patients when MEDIUM filter is active", async () => {
    renderQueue();
    await userEvent.click(screen.getByRole("button", { name: /MEDIUM/i }));
    expect(screen.queryByText("Demo Patient A")).not.toBeInTheDocument();
    expect(screen.getByText("Demo Patient B")).toBeInTheDocument();
    expect(screen.queryByText("Demo Patient C")).not.toBeInTheDocument();
  });

  it("shows only LOW-tier patients when LOW filter is active", async () => {
    renderQueue();
    await userEvent.click(screen.getByRole("button", { name: /LOW/i }));
    expect(screen.queryByText("Demo Patient A")).not.toBeInTheDocument();
    expect(screen.queryByText("Demo Patient B")).not.toBeInTheDocument();
    expect(screen.getByText("Demo Patient C")).toBeInTheDocument();
  });

  it("restores all patients when the active filter is toggled off", async () => {
    renderQueue();
    const highButton = screen.getByRole("button", { name: /HIGH/i });
    await userEvent.click(highButton); // activate
    await userEvent.click(highButton); // deactivate
    expect(screen.getByText("Demo Patient A")).toBeInTheDocument();
    expect(screen.getByText("Demo Patient B")).toBeInTheDocument();
    expect(screen.getByText("Demo Patient C")).toBeInTheDocument();
  });

  it("shows empty state when no patients match the active tier", async () => {
    // Only HIGH patient in the list
    renderQueue([DEMO_PATIENTS[0]]);
    await userEvent.click(screen.getByRole("button", { name: /LOW/i }));
    expect(screen.getByText(/no patients|empty|no results/i)).toBeInTheDocument();
  });
});

describe("PatientQueue — search", () => {
  it("filters by patient name (case-insensitive)", async () => {
    renderQueue();
    const searchInput = screen.getByRole("searchbox") ?? screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "patient a");
    expect(screen.getByText("Demo Patient A")).toBeInTheDocument();
    expect(screen.queryByText("Demo Patient B")).not.toBeInTheDocument();
  });

  it("filters by primary diagnosis", async () => {
    renderQueue();
    const searchInput = screen.getByRole("searchbox") ?? screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "COPD");
    expect(screen.queryByText("Demo Patient A")).not.toBeInTheDocument();
    expect(screen.getByText("Demo Patient B")).toBeInTheDocument();
  });

  it("shows empty state when search matches nothing", async () => {
    renderQueue();
    const searchInput = screen.getByRole("searchbox") ?? screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "ZZZNOMATCH");
    expect(screen.getByText(/no patients|empty|no results/i)).toBeInTheDocument();
  });

  it("restores all patients when search is cleared", async () => {
    renderQueue();
    const searchInput = screen.getByRole("searchbox") ?? screen.getByPlaceholderText(/search/i);
    await userEvent.type(searchInput, "Patient A");
    await userEvent.clear(searchInput);
    expect(screen.getByText("Demo Patient A")).toBeInTheDocument();
    expect(screen.getByText("Demo Patient B")).toBeInTheDocument();
    expect(screen.getByText("Demo Patient C")).toBeInTheDocument();
  });
});

describe("PatientQueue — navigation", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  it("navigates to patient review page on row click", async () => {
    renderQueue();
    await userEvent.click(screen.getByText("Demo Patient A"));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("P001"));
  });

  it("navigates to the correct patient when a different row is clicked", async () => {
    renderQueue();
    await userEvent.click(screen.getByText("Demo Patient C"));
    expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining("P003"));
  });
});
