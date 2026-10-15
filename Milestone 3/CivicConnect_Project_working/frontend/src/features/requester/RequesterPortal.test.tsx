import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import RequesterPortal from "./RequesterPortal";

// These mocks test the integrated React workflow and API contract.
// A separate browser/server E2E test is still required for M3.
const api = vi.hoisted(() => ({
  registerRequester: vi.fn(),
  loginRequester: vi.fn(),
  listMyRequests: vi.fn(),
  submitMunicipalRequest: vi.fn(),
  getMyRequest: vi.fn(),
}));

vi.mock("./requesterApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("./requesterApi")>();
  return { ...original, ...api };
});

const exampleRequest = {
  id: "f17ebee4-49d0-4ef5-b39a-789c0e4458b6",
  reference: "CC-2026-000001",
  requesterId: "requester-1",
  category: "STREET_LIGHTING",
  title: "Broken street light near park",
  description: "The street light near the park entrance is not working.",
  location: "Park entrance, Street 4",
  priority: "MEDIUM",
  status: "SUBMITTED",
  createdAt: "2026-10-14T18:00:00.000Z",
  updatedAt: "2026-10-14T18:00:00.000Z",
} as const;

beforeEach(() => {
  vi.clearAllMocks();
  api.registerRequester.mockResolvedValue({
    token: "test-requester-token",
    user: {
      id: "requester-1",
      name: "Test Resident",
      email: "resident@example.test",
      role: "REQUESTER",
    },
  });
  api.listMyRequests.mockResolvedValue({ items: [], total: 0 });
  api.submitMunicipalRequest.mockResolvedValue({
    message: "Request created",
    request: exampleRequest,
  });
  api.getMyRequest.mockResolvedValue({ request: exampleRequest });
});

async function registerThroughPortal(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByRole("textbox", { name: /Full Name/i }), "Test Resident");
  await user.type(screen.getByRole("textbox", { name: /^Email$/i }), "resident@example.test");
  await user.type(screen.getByLabelText(/^Password$/i), "SafeTestPassword123!");
  await user.click(screen.getByRole("button", { name: /Register and Continue/i }));
  await screen.findByRole("button", { name: "Sign out" });
  expect(api.registerRequester).toHaveBeenCalledOnce();
}

describe("RequesterPortal authenticated API workflow", () => {
  it("submits a request and tracks its backend reference", async () => {
    const user = userEvent.setup();
    render(<RequesterPortal />);
    await registerThroughPortal(user);

    await user.clear(screen.getByRole("textbox", { name: /Request Title/i }));
    await user.type(
      screen.getByRole("textbox", { name: /Request Title/i }),
      exampleRequest.title,
    );
    await user.clear(screen.getByRole("textbox", { name: /Detailed Description/i }));
    await user.type(
      screen.getByRole("textbox", { name: /Detailed Description/i }),
      exampleRequest.description,
    );
    await user.clear(screen.getByRole("textbox", { name: /Physical Location/i }));
    await user.type(
      screen.getByRole("textbox", { name: /Physical Location/i }),
      exampleRequest.location,
    );

    await user.click(screen.getByRole("button", { name: /Submit Official Ticket/i }));

    await waitFor(() => expect(api.submitMunicipalRequest).toHaveBeenCalledOnce());
    expect(api.submitMunicipalRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "Street Lighting",
        title: exampleRequest.title,
        location: exampleRequest.location,
      }),
      "test-requester-token",
    );

    const submissionsTable = await screen.findByRole("table");
    expect(within(submissionsTable).getByText(exampleRequest.reference)).toBeInTheDocument();

    const trackedRequest = screen.getByRole("region", { name: "Tracked service request" });
    expect(within(trackedRequest).getByText(exampleRequest.reference)).toBeInTheDocument();
    expect(trackedRequest).toHaveTextContent(exampleRequest.title);
    expect(trackedRequest).toHaveTextContent("Submitted");
    await waitFor(() => expect(api.getMyRequest).toHaveBeenCalledWith(
      exampleRequest.id,
      "test-requester-token",
    ));
  });

  it("rejects empty title and description before calling the API", async () => {
    const user = userEvent.setup();
    render(<RequesterPortal />);
    await registerThroughPortal(user);

    await user.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByRole("textbox", { name: /Request Title/i })).toHaveValue("");
    expect(screen.getByRole("textbox", { name: /Detailed Description/i })).toHaveValue("");

    await user.click(screen.getByRole("button", { name: /Submit Official Ticket/i }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Request title is required.");
    expect(alert).toHaveTextContent("Request description is required.");
    expect(api.submitMunicipalRequest).not.toHaveBeenCalled();
  });

  it("shows an API failure without creating a request or showing success", async () => {
    api.submitMunicipalRequest.mockRejectedValue(new Error("API unavailable"));
    const user = userEvent.setup();
    render(<RequesterPortal />);
    await registerThroughPortal(user);

    // Default form fields already contain valid example values.
    await user.click(screen.getByRole("button", { name: /Submit Official Ticket/i }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("API unavailable");
    expect(screen.queryByText(exampleRequest.reference)).not.toBeInTheDocument();
    expect(api.getMyRequest).not.toHaveBeenCalled();
  });
});
