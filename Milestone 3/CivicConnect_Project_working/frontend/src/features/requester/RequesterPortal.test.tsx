
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RequesterPortal from "./RequesterPortal";

/**
 * SEN381 M3 — Requester frontend integration tests.
 *
 * Tests exercise the existing RequestForm, RequesterPortal,
 * RecentSubmissions and TicketTracker together.
 */
describe("RequesterPortal", () => {
  it("adds a valid request to the register and makes it trackable", async () => {
    // TC-REQ-005 — successful demonstration submission

    const user = userEvent.setup();

    render(<RequesterPortal />);

    await user.type(
      screen.getByRole("textbox", {
        name: /Request Title/i,
      }),
      "Broken street light near park",
    );

    await user.type(
      screen.getByRole("textbox", {
        name: /Detailed Description/i,
      }),
      "The street light near the park entrance is not working.",
    );

    await user.click(
      screen.getByRole("button", {
        name: /Submit Official Ticket/i,
      }),
    );

    // The first newly generated demonstration ID is CV-9282.
    const submissionsTable = screen.getByRole("table");

    expect(
      within(submissionsTable).getByText("CV-9282"),
    ).toBeInTheDocument();

    // The tracker must select the same newly created record.
    const trackedRequest = screen.getByRole("region", {
      name: "Tracked service request",
    });

    expect(
      await within(trackedRequest).findByText("CV-9282"),
    ).toBeInTheDocument();

    expect(trackedRequest).toHaveTextContent(
      "Broken street light near park",
    );

    expect(trackedRequest).toHaveTextContent(
      "In Progress",
    );
  });

 
it("rejects requests without a title and description", async () => {
  // TC-REQ-006
  // Negative test: a request must not be accepted
  // when its required fields are empty.

  const user = userEvent.setup();

  render(<RequesterPortal />);

  // The demonstration form may initially contain
  // example values. Reset it before testing validation.
  await user.click(
    screen.getByRole("button", {
      name: "Clear",
    }),
  );

  // Confirm both required fields are now empty.
  const titleInput = screen.getByRole("textbox", {
    name: /Request Title/i,
  });

  const descriptionInput = screen.getByRole("textbox", {
    name: /Detailed Description/i,
  });

  expect(titleInput).toHaveValue("");
  expect(descriptionInput).toHaveValue("");

  // Attempt to submit without the required information.
  await user.click(
    screen.getByRole("button", {
      name: /Submit Official Ticket/i,
    }),
  );

  // Verify that both validation messages appear.
  const validationAlert = await screen.findByRole("alert");

  expect(validationAlert).toHaveTextContent(
    "Request title is required.",
  );

  expect(validationAlert).toHaveTextContent(
    "Request description is required.",
  );

  // Verify that an invalid submission did NOT create a case.
  const submissionsTable = screen.getByRole("table");

  expect(
    within(submissionsTable).queryByText("CV-9282"),
  ).not.toBeInTheDocument();
});

});
