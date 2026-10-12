import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RequestManagementLifecyclePage from "./RequestManagementLifecyclePage";

describe("RequestManagementLifecyclePage", () => {
  it("displays the request lifecycle and case details", () => {
    // Requirement: FR-STF-005
    // Staff must be able to view full request details.
    render(<RequestManagementLifecyclePage />);

    expect(
      screen.getByRole("heading", {
        name: "Request Lifecycle & Audit",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "Incident Specifications & Field Intelligence",
      }),
    ).toBeInTheDocument();

    // Verify the subcategory is displayed in the case details.
    // Use an exact match to distinguish it from the page description.
    expect(
    screen.getByText("Pressurised Main Rupture", { exact: true }),
    ).toBeInTheDocument();
    
    expect(
      screen.getByRole("heading", {
        name: "Case Ownership",
      }),
    ).toBeInTheDocument();
  });

  it("does not show internal notes in the public message panel", async () => {
    // Risk: Staff-only information could be shown to citizens.
    // This verifies UI separation, NOT API authorisation.
    const user = userEvent.setup();

    render(<RequestManagementLifecyclePage />);

    expect(
      screen.getByText(/Spoke with the district superintendent/),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("tab", {
        name: /Public Citizen Messages/i,
      }),
    );

    const publicPanel = screen.getByRole("tabpanel", {
      name: "Public citizen messages",
    });

    expect(
      within(publicPanel).getByText(
        /The request remains in progress/,
      ),
    ).toBeInTheDocument();

    expect(
      within(publicPanel).queryByText(
        /Spoke with the district superintendent/,
      ),
    ).not.toBeInTheDocument();
  });

  it("displays audit events in the audit trail tab", async () => {
    // Requirement: FR-SEC-004 / NFR-AUD-001
    // Checks rendering of existing audit data, not persistence.
    const user = userEvent.setup();

    render(<RequestManagementLifecyclePage />);

    await user.click(
      screen.getByRole("tab", {
        name: /System Audit Trail/i,
      }),
    );

    const auditPanel = screen.getByRole("tabpanel", {
      name: "System audit trail",
    });

    expect(
      within(auditPanel).getByText("Request submitted"),
    ).toBeInTheDocument();

    expect(
      within(auditPanel).getByText(/The request entered the service-request lifecycle/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("tab", {
        name: /System Audit Trail/i,
      }),
    ).toHaveAttribute("aria-selected", "true");
  });
});