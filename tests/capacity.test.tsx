/**
 * Tests for <CapacitySettings /> and <AllocationBoard />
 *
 * Covers:
 * - Current capacity usage vs. limit is displayed
 * - Coordinator can change the daily limit
 * - Limit change is persisted to local storage
 * - Allocation board shows assigned patients and remaining slots
 * - New allocations are blocked once the limit is reached
 * - UI signals exhausted capacity clearly
 * - Limit cannot be set below zero or below current usage
 * - Reset Demo restores the default capacity values
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import CapacitySettings from "@/components/capacity/capacity-settings";
import AllocationBoard from "@/components/capacity/allocation-board";
import * as localStorageLib from "@/lib/local-storage";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const ASSIGNED_PATIENTS = [
  { id: "P001", name: "Demo Patient A", risk_tier: "HIGH", action: "Schedule 48h follow-up call" },
  { id: "P002", name: "Demo Patient B", risk_tier: "MEDIUM", action: "Schedule clinic follow-up" },
];

function makeWorkflowState(overrides: Partial<{
  capacityUsed: number;
  capacityLimit: number;
  actions: Record<string, unknown>;
  auditLog: unknown[];
}> = {}) {
  return {
    actions: {},
    capacityUsed: 2,
    capacityLimit: 10,
    auditLog: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/local-storage", () => ({
  getDemoWorkflowState: vi.fn(),
  saveDemoWorkflowState: vi.fn(),
  resetDemoWorkflow: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Tests: CapacitySettings
// ---------------------------------------------------------------------------

describe("CapacitySettings — display", () => {
  beforeEach(() => {
    vi.mocked(localStorageLib.getDemoWorkflowState).mockReturnValue(
      makeWorkflowState()
    );
  });

  it("shows the current daily limit", () => {
    render(<CapacitySettings />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
  });

  it("shows the current usage count", () => {
    render(<CapacitySettings />);
    expect(screen.getByText(/2/)).toBeInTheDocument();
  });

  it("shows remaining slots", () => {
    render(<CapacitySettings />);
    expect(screen.getByText(/8/)).toBeInTheDocument(); // 10 - 2 = 8
  });
});

describe("CapacitySettings — limit adjustment", () => {
  beforeEach(() => {
    vi.mocked(localStorageLib.getDemoWorkflowState).mockReturnValue(
      makeWorkflowState()
    );
    vi.mocked(localStorageLib.saveDemoWorkflowState).mockClear();
  });

  it("allows the coordinator to increase the daily limit", async () => {
    render(<CapacitySettings />);
    const input =
      screen.getByRole("spinbutton") ??
      screen.getByLabelText(/daily limit/i) ??
      screen.getByDisplayValue("10");

    await userEvent.clear(input);
    await userEvent.type(input, "15");

    const saveButton = screen.getByRole("button", { name: /save|update|apply/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(localStorageLib.saveDemoWorkflowState).toHaveBeenCalledWith(
        expect.objectContaining({ capacityLimit: 15 })
      );
    });
  });

  it("allows the coordinator to decrease the daily limit above current usage", async () => {
    render(<CapacitySettings />);
    const input =
      screen.getByRole("spinbutton") ??
      screen.getByDisplayValue("10");

    await userEvent.clear(input);
    await userEvent.type(input, "5"); // still above capacityUsed (2)

    const saveButton = screen.getByRole("button", { name: /save|update|apply/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(localStorageLib.saveDemoWorkflowState).toHaveBeenCalledWith(
        expect.objectContaining({ capacityLimit: 5 })
      );
    });
  });

  it("shows a validation error when limit is set below current usage", async () => {
    vi.mocked(localStorageLib.getDemoWorkflowState).mockReturnValue(
      makeWorkflowState({ capacityUsed: 8, capacityLimit: 10 })
    );
    render(<CapacitySettings />);

    const input =
      screen.getByRole("spinbutton") ??
      screen.getByDisplayValue("10");

    await userEvent.clear(input);
    await userEvent.type(input, "5"); // below capacityUsed (8)

    const saveButton = screen.getByRole("button", { name: /save|update|apply/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/below current|cannot reduce|exceeds/i)
      ).toBeInTheDocument();
    });
    expect(localStorageLib.saveDemoWorkflowState).not.toHaveBeenCalled();
  });

  it("shows a validation error when limit is set to zero", async () => {
    render(<CapacitySettings />);
    const input =
      screen.getByRole("spinbutton") ??
      screen.getByDisplayValue("10");

    await userEvent.clear(input);
    await userEvent.type(input, "0");

    const saveButton = screen.getByRole("button", { name: /save|update|apply/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid|must be greater|positive/i)
      ).toBeInTheDocument();
    });
  });

  it("shows a validation error when limit is negative", async () => {
    render(<CapacitySettings />);
    const input =
      screen.getByRole("spinbutton") ??
      screen.getByDisplayValue("10");

    await userEvent.clear(input);
    await userEvent.type(input, "-3");

    const saveButton = screen.getByRole("button", { name: /save|update|apply/i });
    await userEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/invalid|must be greater|positive/i)
      ).toBeInTheDocument();
    });
  });
});

// ---------------------------------------------------------------------------
// Tests: AllocationBoard
// ---------------------------------------------------------------------------

describe("AllocationBoard — display", () => {
  it("renders each assigned patient row", () => {
    vi.mocked(localStorageLib.getDemoWorkflowState).mockReturnValue(
      makeWorkflowState()
    );
    render(
      <AllocationBoard
        patients={ASSIGNED_PATIENTS}
        capacityUsed={2}
        capacityLimit={10}
      />
    );
    expect(screen.getByText("Demo Patient A")).toBeInTheDocument();
    expect(screen.getByText("Demo Patient B")).toBeInTheDocument();
  });

  it("displays the assigned action for each patient", () => {
    vi.mocked(localStorageLib.getDemoWorkflowState).mockReturnValue(
      makeWorkflowState()
    );
    render(
      <AllocationBoard
        patients={ASSIGNED_PATIENTS}
        capacityUsed={2}
        capacityLimit={10}
      />
    );
    expect(screen.getByText(/schedule 48h follow-up call/i)).toBeInTheDocument();
  });

  it("renders remaining slots count", () => {
    vi.mocked(localStorageLib.getDemoWorkflowState).mockReturnValue(
      makeWorkflowState()
    );
    render(
      <AllocationBoard
        patients={ASSIGNED_PATIENTS}
        capacityUsed={2}
        capacityLimit={10}
      />
    );
    // 10 - 2 = 8 remaining
    expect(screen.getByText(/8/)).toBeInTheDocument();
  });
});

describe("AllocationBoard — capacity exhaustion", () => {
  it("shows exhausted state when used equals limit", () => {
    render(
      <AllocationBoard
        patients={ASSIGNED_PATIENTS}
        capacityUsed={10}
        capacityLimit={10}
      />
    );
    expect(
      screen.getByText(/capacity full|limit reached|no slots/i)
    ).toBeInTheDocument();
  });

  it("shows 0 remaining slots when capacity is full", () => {
    render(
      <AllocationBoard
        patients={ASSIGNED_PATIENTS}
        capacityUsed={10}
        capacityLimit={10}
      />
    );
    expect(screen.getByText(/0 remaining|0 slots/i)).toBeInTheDocument();
  });

  it("does not show exhausted state when slots are available", () => {
    render(
      <AllocationBoard
        patients={ASSIGNED_PATIENTS}
        capacityUsed={2}
        capacityLimit={10}
      />
    );
    expect(
      screen.queryByText(/capacity full|limit reached|no slots/i)
    ).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests: Reset Demo
// ---------------------------------------------------------------------------

describe("CapacitySettings — Reset Demo", () => {
  it("calls resetDemoWorkflow when Reset Demo is clicked", async () => {
    vi.mocked(localStorageLib.getDemoWorkflowState).mockReturnValue(
      makeWorkflowState()
    );
    render(<CapacitySettings showReset />);

    const resetBtn = screen.getByRole("button", { name: /reset demo/i });
    await userEvent.click(resetBtn);

    await waitFor(() => {
      expect(localStorageLib.resetDemoWorkflow).toHaveBeenCalled();
    });
  });

  it("restores default capacity limit display after reset", async () => {
    const DEFAULT_LIMIT = 10;
    vi.mocked(localStorageLib.getDemoWorkflowState)
      .mockReturnValueOnce(makeWorkflowState({ capacityLimit: 25 }))
      .mockReturnValueOnce(makeWorkflowState({ capacityLimit: DEFAULT_LIMIT }));

    render(<CapacitySettings showReset />);
    await userEvent.click(screen.getByRole("button", { name: /reset demo/i }));

    await waitFor(() => {
      expect(screen.getByText(new RegExp(String(DEFAULT_LIMIT)))).toBeInTheDocument();
    });
  });
});
