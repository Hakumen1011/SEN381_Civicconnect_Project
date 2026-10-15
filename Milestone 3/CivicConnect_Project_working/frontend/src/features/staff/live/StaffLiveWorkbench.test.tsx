import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StaffLiveWorkbench from "./StaffLiveWorkbench";
import {
  assignToMe,
  changeRequestStatus,
  listStaffRequests,
  loginStaff,
  type LiveRequest,
  type StaffSession,
} from "./staffApi";

vi.mock("./staffApi", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./staffApi")>();
  return {
    ...actual,
    loginStaff: vi.fn(),
    listStaffRequests: vi.fn(),
    assignToMe: vi.fn(),
    changeRequestStatus: vi.fn(),
    getStaffAuditTrail: vi.fn(),
  };
});

const session: StaffSession = {
  token: "staff-test-token",
  user: { id: "staff-01", name: "Staff Member", email: "staff@example.test", role: "STAFF" },
};
const sample: LiveRequest = {
  id: "70c070b5-a448-4c79-8848-61645b0790c4",
  reference: "CC-2026-12345",
  requesterId: "resident-01",
  title: "Street light outage",
  description: "Lamp outside the municipal offices has failed",
  category: "STREET_LIGHTING",
  location: "Town Hall",
  priority: "MEDIUM",
  status: "SUBMITTED",
  assigneeId: null,
  resolution: null,
  dueAt: "2026-10-16T08:00:00Z",
  createdAt: "2026-10-15T08:00:00Z",
  updatedAt: "2026-10-15T08:00:00Z",
  version: 1,
  overdue: false,
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(loginStaff).mockResolvedValue(session);
  vi.mocked(listStaffRequests).mockResolvedValue({ items: [sample], total: 1, page: 1, pageSize: 100 });
});

async function signIn() {
  const user = userEvent.setup();
  render(<StaffLiveWorkbench />);
  await user.type(screen.getByLabelText("Staff email"), "staff@example.test");
  await user.type(screen.getByLabelText("Password"), "testing-password");
  await user.click(screen.getByRole("button", { name: "Sign in as staff" }));
  expect(await screen.findByRole("region", { name: "Live staff operations" })).toBeInTheDocument();
  return user;
}

describe("Live Staff Operations", () => {
  it("loads backend records after authentication and self-assigns a submitted request", async () => {
    vi.mocked(assignToMe).mockResolvedValue({ request: { ...sample, status: "ASSIGNED", assigneeId: session.user.id, version: 3 } });
    const user = await signIn();
    expect(screen.getByText("CC-2026-12345")).toBeInTheDocument();
    expect(listStaffRequests).toHaveBeenCalledWith("staff-test-token");
    await user.click(screen.getByRole("button", { name: "Assign CC-2026-12345 to me" }));
    expect(assignToMe).toHaveBeenCalledWith(sample.id, "staff-test-token");
    expect(await screen.findByText("ASSIGNED")).toBeInTheDocument();
  });

  it("updates an assigned request and supplies the correct next status", async () => {
    const assigned = { ...sample, status: "ASSIGNED" as const, assigneeId: session.user.id, version: 3 };
    vi.mocked(listStaffRequests).mockResolvedValueOnce({ items: [assigned], total: 1, page: 1, pageSize: 100 });
    vi.mocked(changeRequestStatus).mockResolvedValue({ request: { ...assigned, status: "IN_PROGRESS", version: 4 } });
    const user = await signIn();
    await user.selectOptions(screen.getByLabelText("Next status for CC-2026-12345"), "IN_PROGRESS");
    await user.click(screen.getByRole("button", { name: "Update status for CC-2026-12345" }));
    expect(changeRequestStatus).toHaveBeenCalledWith(assigned, "IN_PROGRESS", "", "staff-test-token");
    expect(await screen.findByText("IN PROGRESS")).toBeInTheDocument();
  });

  it("rejects login errors without displaying staff request data", async () => {
    vi.mocked(loginStaff).mockRejectedValue(new Error("Incorrect email or password"));
    const user = userEvent.setup();
    render(<StaffLiveWorkbench />);
    await user.type(screen.getByLabelText("Staff email"), "wrong@example.test");
    await user.type(screen.getByLabelText("Password"), "bad-password");
    await user.click(screen.getByRole("button", { name: "Sign in as staff" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect email or password");
    expect(screen.queryByText("CC-2026-12345")).not.toBeInTheDocument();
  });
});
