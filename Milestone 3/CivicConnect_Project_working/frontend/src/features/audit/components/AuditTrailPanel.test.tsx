import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CaseAuditEvent } from
  "../../request-management/components/requestManagementTypes";

import AuditTrailPanel from "./AuditTrailPanel";

const testEvents: CaseAuditEvent[] = [
  {
    id: "A-001",
    actor: "Resident",
    action: "Request submitted",
    timestamp: "2026-10-09T08:00:00+02:00",
    details: "Initial report received.",
  },
  {
    id: "A-002",
    actor: "Eleanor Vance",
    action: "Case assigned",
    timestamp: "2026-10-10T10:00:00+02:00",
    details: "Field response team assigned.",
  },
];

describe("AuditTrailPanel", () => {
  it("displays the supplied audit records", () => {
    render(
      <AuditTrailPanel
        caseReference="CC-TEST-001"
        events={testEvents}
      />,
    );

    const panel = screen.getByRole("region", {
      name: "Audit history for CC-TEST-001",
    });

    expect(
      within(panel).getByText("Request submitted"),
    ).toBeInTheDocument();

    expect(
      within(panel).getByText("Case assigned"),
    ).toBeInTheDocument();

    expect(
      within(panel).getByText("2 of 2 events"),
    ).toBeInTheDocument();
  });

  it("filters the displayed history when the user searches", async () => {
    const user = userEvent.setup();

    render(
      <AuditTrailPanel
        caseReference="CC-TEST-001"
        events={testEvents}
      />,
    );

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search audit history",
      }),
      "Eleanor",
    );

    expect(
      screen.getByText("Case assigned"),
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Request submitted"),
    ).not.toBeInTheDocument();

    expect(
      screen.getByText("1 of 2 events"),
    ).toBeInTheDocument();
  });

  it("displays a useful message when no events match", async () => {
    const user = userEvent.setup();

    render(
      <AuditTrailPanel
        caseReference="CC-TEST-001"
        events={testEvents}
      />,
    );

    await user.type(
      screen.getByRole("searchbox", {
        name: "Search audit history",
      }),
      "unmatched search term",
    );

    expect(
      screen.getByText("No matching audit events"),
    ).toBeInTheDocument();

    expect(
      screen.getByText("0 of 2 events"),
    ).toBeInTheDocument();
  });
});

it("shows a helpful message when the case has no audit records", () => {
  render(
    <AuditTrailPanel
      caseReference="CC-EMPTY-001"
      events={[]}
    />,
  );

  expect(
    screen.getByText("No matching audit events"),
  ).toBeInTheDocument();

  expect(
    screen.getByText(
      "No audit events have been provided for this case.",
    ),
  ).toBeInTheDocument();

  expect(
    screen.getByText("0 of 0 events"),
  ).toBeInTheDocument();
});