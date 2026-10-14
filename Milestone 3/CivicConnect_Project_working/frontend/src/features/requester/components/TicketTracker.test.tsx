
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TicketTracker from "./TicketTracker";
import { initialSubmissions } from "../requesterData";

/**
 * SEN381 M3 — Ticket tracking functional tests.
 *
 * Test basis:
 * - Correct association between case reference and details
 * - Case-insensitive lookup
 * - Unknown-case rejection
 * - Empty input validation
 */
describe("TicketTracker", () => {
  it("displays details for the initial sample case", () => {
    // TC-REQ-001

    render(
      <TicketTracker
        submissions={initialSubmissions}
        caseId="CV-9281"
      />,
    );

    const details = screen.getByRole("region", {
      name: "Tracked service request",
    });

    expect(details).toHaveTextContent("CV-9281");

    expect(details).toHaveTextContent(
      "1400 Oakridge Terrace",
    );

    expect(details).toHaveTextContent("In Progress");

    expect(details).toHaveTextContent(
      "Demonstration event history for CV-9281.",
    );
  });

  it("retrieves the correct record using a case-insensitive reference", async () => {
    // TC-REQ-002

    const user = userEvent.setup();

    render(
      <TicketTracker
        submissions={initialSubmissions}
        caseId="CV-9281"
      />,
    );

    const lookup = screen.getByRole("textbox", {
      name: "Ticket case ID",
    });

    await user.clear(lookup);
    await user.type(lookup, "cv-8804");

    await user.click(
      screen.getByRole("button", {
        name: "Track",
      }),
    );

    const details = screen.getByRole("region", {
      name: "Tracked service request",
    });

    expect(details).toHaveTextContent("CV-8804");
    expect(details).toHaveTextContent(
      "Fairmount Community Park",
    );
    expect(details).toHaveTextContent("Resolved");

    expect(
      within(details).queryByText(
        "Deep Asphalt Fissure & Pothole Hazard",
      ),
    ).not.toBeInTheDocument();

    expect(details).toHaveTextContent(
      "No detailed event history is available",
    );
  });

  it("does not display unrelated details for an unknown case", async () => {
    // TC-REQ-003 — negative / unknown reference

    const user = userEvent.setup();

    render(
      <TicketTracker
        submissions={initialSubmissions}
        caseId="CV-9281"
      />,
    );

    const lookup = screen.getByRole("textbox", {
      name: "Ticket case ID",
    });

    await user.clear(lookup);
    await user.type(lookup, "CV-9999");

    await user.click(
      screen.getByRole("button", {
        name: "Track",
      }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Case CV-9999 was not found",
    );

    expect(
      screen.queryByRole("region", {
        name: "Tracked service request",
      }),
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "No case selected",
      }),
    ).toBeInTheDocument();
  });

  it("rejects an empty case reference", async () => {
    // TC-REQ-004 — negative / empty input

    const user = userEvent.setup();

    render(
      <TicketTracker
        submissions={initialSubmissions}
        caseId="CV-9281"
      />,
    );

    await user.clear(
      screen.getByRole("textbox", {
        name: "Ticket case ID",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: "Track",
      }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Enter a case ID before tracking.",
    );

    expect(
      screen.queryByRole("region", {
        name: "Tracked service request",
      }),
    ).not.toBeInTheDocument();
  });
});
