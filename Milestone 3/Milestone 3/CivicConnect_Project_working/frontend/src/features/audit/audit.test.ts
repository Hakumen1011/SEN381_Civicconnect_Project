import { describe, expect, it } from "vitest";

import type { CaseAuditEvent } from
  "../request-management/components/requestManagementTypes";

import { filterAuditEvents } from "./audit";

const testEvents: CaseAuditEvent[] = [
  {
    id: "AUD-001",
    actor: "Resident",
    action: "Request submitted",
    timestamp: "2026-10-09T08:00:00+02:00",
    details: "Water leak reported.",
  },
  {
    id: "AUD-002",
    actor: "Eleanor Vance",
    action: "Case assigned",
    timestamp: "2026-10-10T10:00:00+02:00",
    details: "Assigned to field operations.",
  },
  {
    id: "AUD-003",
    actor: "System",
    action: "Status changed",
    timestamp: "2026-10-11T12:00:00+02:00",
    details: "Request moved to In Progress.",
  },
];

describe("Audit history filtering and sorting", () => {
  it("filters events by actor name", () => {
    const results = filterAuditEvents(testEvents, {
      searchText: "Eleanor",
      sortOrder: "newest",
    });

    expect(results.map((event) => event.id)).toEqual([
      "AUD-002",
    ]);
  });

  it("matches event actions without case sensitivity", () => {
    const results = filterAuditEvents(testEvents, {
      searchText: "STATUS CHANGED",
      sortOrder: "newest",
    });

    expect(results.map((event) => event.id)).toEqual([
      "AUD-003",
    ]);
  });

  it("searches event details", () => {
    const results = filterAuditEvents(testEvents, {
      searchText: "water leak",
      sortOrder: "newest",
    });

    expect(results.map((event) => event.id)).toEqual([
      "AUD-001",
    ]);
  });

  it("sorts events newest first", () => {
    const results = filterAuditEvents(testEvents, {
      searchText: "",
      sortOrder: "newest",
    });

    expect(results.map((event) => event.id)).toEqual([
      "AUD-003",
      "AUD-002",
      "AUD-001",
    ]);
  });

  it("sorts oldest first without modifying the input", () => {
    const originalOrder = testEvents.map(
      (event) => event.id,
    );

    const results = filterAuditEvents(testEvents, {
      searchText: "",
      sortOrder: "oldest",
    });

    expect(results.map((event) => event.id)).toEqual([
      "AUD-001",
      "AUD-002",
      "AUD-003",
    ]);

    expect(testEvents.map((event) => event.id)).toEqual(
      originalOrder,
    );
  });

  it("returns an empty array when nothing matches", () => {
    const results = filterAuditEvents(testEvents, {
      searchText: "unknown event",
      sortOrder: "newest",
    });

    expect(results).toEqual([]);
  });
});