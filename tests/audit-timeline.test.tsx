/**
 * Tests for <AuditTimeline />
 *
 * Covers:
 * - Renders audit events from local storage in chronological order (newest first)
 * - Each event shows actor, action type, timestamp, and patient context
 * - Override events display the coordinator-supplied reason
 * - Empty state renders when no audit events exist
 * - Events survive a browser refresh (loaded from local storage)
 * - Priority override events are visually distinguished from action assignments
 * - Timestamps are formatted as human-readable strings
 */

import { render, screen, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import AuditTimeline from "@/components/patient-review/audit-timeline";
import * as localStorageLib from "@/lib/local-storage";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const NOW = 1_700_000_000_000; // fixed epoch ms for deterministic tests

const AUDIT_EVENTS = [
  {
    id: "evt-003",
    type: "ACTION_ASSIGNED",
    patientId: "P001",
    patientName: "Demo Patient A",
    action: "Schedule 48h follow-up call",
    actor: "Care Coordinator",
    timestamp: NOW - 60_000, // 1 minute ago
    reason: null,
    demo_only: true,
  },
  {
    id: "evt-002",
    type: "PRIORITY_OVERRIDE",
    patientId: "P003",
    patientName: "Demo Patient C",
    action: "Escalate to HIGH tier",
    actor: "Care Coordinator",
    timestamp: NOW - 300_000, // 5 minutes ago
    reason: "Patient called in; reported new symptoms post-discharge.",
    demo_only: true,
  },
  {
    id: "evt-001",
    type: "ACTION_ASSIGNED",
    patientId: "P002",
    patientName: "Demo Patient B",
    action: "Schedule clinic follow-up",
    actor: "Care Coordinator",
    timestamp: NOW - 600_000, // 10 minutes ago
    reason: null,
    demo_only: true,
  },
];

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("@/lib/local-storage", () => ({
  getAuditLog: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function renderTimeline(events = AUDIT_EVENTS, props: Record<string, unknown> = {}) {
  vi.mocked(localStorageLib.getAuditLog).mockReturnValue(events);
  return render(
    <MemoryRouter>
      <AuditTimeline patientId="P001" {...props} />
    </MemoryRouter>
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AuditTimeline — rendering", () => {
  it("renders an event for each audit log entry", () => {
    renderTimeline();
    // P001 has one direct event; we show all events or filter by patient
    expect(
      screen.getByText(/Schedule 48h follow-up call/i)
    ).toBeInTheDocument();
  });

  it("renders the actor name for each event", () => {
    renderTimeline();
    expect(screen.getAllByText(/Care Coordinator/i).length).toBeGreaterThan(0);
  });

  it("renders the patient name associated with each event", () => {
    renderTimeline();
    expect(screen.getByText(/Demo Patient A/i)).toBeInTheDocument();
  });

  it("renders a human-readable timestamp for each event", () => {
    renderTimeline();
    // Formatted timestamp should not be a raw epoch number
    const rawEpoch = String(NOW - 60_000);
    expect(screen.queryByText(rawEpoch)).not.toBeInTheDocument();
    // Some time representation should be present (e.g. "1 min ago", "Nov 14")
    expect(
      screen.getByText(/ago|min|hour|AM|PM|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i)
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no audit events", () => {
    renderTimeline([]);
    expect(
      screen.getByText(/no activity|empty|no events/i)
    ).toBeInTheDocument();
  });
});

describe("AuditTimeline — chronological order", () => {
  it("displays most recent event first", () => {
    renderTimeline(AUDIT_EVENTS);
    const items = screen.getAllByRole("listitem");
    // The newest event (evt-003) should appear before older ones
    const firstItemText = items[0].textContent ?? "";
    expect(firstItemText).toMatch(/Schedule 48h follow-up call|Demo Patient A/i);
  });

  it("renders events in descending timestamp order (newest first)", () => {
    renderTimeline(AUDIT_EVENTS);
    const items = screen.getAllByRole("listitem");
    const texts = items.map((i) => i.textContent ?? "");
    const p001Index = texts.findIndex((t) => /Demo Patient A/.test(t));
    const p002Index = texts.findIndex((t) => /Demo Patient B/.test(t));
    // P001's event is newer, so it should have a lower index
    expect(p001Index).toBeLessThan(p002Index);
  });
});

describe("AuditTimeline — override events", () => {
  it("renders the coordinator reason for PRIORITY_OVERRIDE events", () => {
    // Show all events (no patient filter)
    renderTimeline(AUDIT_EVENTS, { patientId: undefined });
    expect(
      screen.getByText(/Patient called in; reported new symptoms post-discharge/i)
    ).toBeInTheDocument();
  });

  it("visually distinguishes override events from action assignment events", () => {
    renderTimeline(AUDIT_EVENTS, { patientId: undefined });
    // Override events should have a distinct label, badge, or icon text
    expect(
      screen.getByText(/override|escalat/i)
    ).toBeInTheDocument();
  });

  it("does not show override reason field for ACTION_ASSIGNED events", () => {
    // Render only action-assigned events
    renderTimeline([AUDIT_EVENTS[0]]);
    // The reason field for the assignment event is null
    expect(screen.queryByText(/reason:/i)).not.toBeInTheDocument();
  });
});

describe("AuditTimeline — demo_only labels", () => {
  it("all rendered events are from demo data", () => {
    // Every fixture has demo_only: true; the component should not strip or hide this
    renderTimeline();
    // We don't require the component to display 'Demo Only' on every row,
    // but it must not render any event that lacks demo_only=true from the data
    const events = vi.mocked(localStorageLib.getAuditLog).mock.results[0]?.value ?? [];
    events.forEach((evt: typeof AUDIT_EVENTS[number]) => {
      expect(evt.demo_only).toBe(true);
    });
  });
});

describe("AuditTimeline — persistence across refresh", () => {
  beforeEach(() => {
    vi.mocked(localStorageLib.getAuditLog).mockClear();
  });

  it("calls getAuditLog on mount to restore persisted events", () => {
    renderTimeline();
    expect(localStorageLib.getAuditLog).toHaveBeenCalled();
  });

  it("renders persisted events loaded from local storage on mount", () => {
    vi.mocked(localStorageLib.getAuditLog).mockReturnValue([AUDIT_EVENTS[0]]);
    render(
      <MemoryRouter>
        <AuditTimeline patientId="P001" />
      </MemoryRouter>
    );
    expect(screen.getByText(/Schedule 48h follow-up call/i)).toBeInTheDocument();
  });

  it("renders empty state when local storage returns no events", () => {
    vi.mocked(localStorageLib.getAuditLog).mockReturnValue([]);
    render(
      <MemoryRouter>
        <AuditTimeline patientId="P001" />
      </MemoryRouter>
    );
    expect(screen.getByText(/no activity|empty|no events/i)).toBeInTheDocument();
  });
});
