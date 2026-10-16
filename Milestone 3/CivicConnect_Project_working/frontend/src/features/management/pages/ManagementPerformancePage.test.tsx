import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthProvider } from "../../../auth/AuthContext";
import type { Role, Session } from "../../../auth/roles";
import type { RequestPage } from "../../staff/live/staffApi";
import type { ManagementSummaryResponse } from "../managementApi";
import { getManagementRequests, getManagementSummary } from "../managementApi";
import ManagementPerformancePage from "./ManagementPerformancePage";

vi.mock("../managementApi", async (importOriginal) => {
  const original = await importOriginal<typeof import("../managementApi")>();
  return { ...original, getManagementSummary: vi.fn(), getManagementRequests: vi.fn() };
});

const summary: ManagementSummaryResponse = {
  generatedAt: "2026-10-16T09:30:00.000Z",
  totals: { all: 2, open: 1, overdue: 1, resolved: 1, closed: 0, rejected: 0 },
  byStatus: { SUBMITTED: 1, ASSIGNED: 0, IN_PROGRESS: 0, ON_HOLD: 0, RESOLVED: 1, CLOSED: 0, REJECTED: 0 },
  byCategory: [
    { category: "ROAD_PAVEMENT", label: "Roads and Pavement", total: 1, open: 1, overdue: 1 },
    { category: "STREET_LIGHTING", label: "Street Lighting", total: 1, open: 0, overdue: 0 },
  ],
  averageResolutionHours: 3.5,
  serviceLevelTargetHours: { LOW: 120, MEDIUM: 72, HIGH: 24 },
};

const records: RequestPage = {
  total: 2, page: 1, pageSize: 20,
  items: [
    { id: "id-one", reference: "CC-2026-1001", requesterId: "u1", title: "Pothole", description: "A pothole", category: "ROAD_PAVEMENT", location: "City", priority: "HIGH", status: "SUBMITTED", assigneeId: null, resolution: null, overdue: true, dueAt: "2026-10-11T09:00:00Z", createdAt: "2026-10-10T09:00:00Z", updatedAt: "2026-10-10T09:00:00Z", version: 1 },
    { id: "id-two", reference: "CC-2026-1002", requesterId: "u2", title: "Light", description: "A streetlight", category: "STREET_LIGHTING", location: "City", priority: "MEDIUM", status: "RESOLVED", assigneeId: "u3", resolution: "Fixed", overdue: false, dueAt: "2026-10-11T09:00:00Z", createdAt: "2026-10-10T09:00:00Z", updatedAt: "2026-10-10T12:30:00Z", version: 4 },
  ],
};

function renderWithRole(role: Role = "MANAGER") {
  const session: Session = { token: "private-test-session", user: { id: "mgr-1", name: "Manager", email: "manager@example.test", role } };
  return render(<AuthProvider initialSession={session}><ManagementPerformancePage /></AuthProvider>);
}

function metric(name: string, count: string) {
  const cards = screen.getByRole("region", { name: "Management summary statistics" });
  const article = within(cards).getByText(name).closest("article");
  expect(article).not.toBeNull();
  expect(within(article as HTMLElement).getByText(count)).toBeInTheDocument();
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getManagementSummary).mockResolvedValue(summary);
  vi.mocked(getManagementRequests).mockResolvedValue(records);
});

describe("ManagementPerformancePage live reporting", () => {
  it("loads system-wide real summary and backend request references for a manager", async () => {
    renderWithRole();
    expect(screen.getByRole("status")).toHaveTextContent("Loading management data");
    await screen.findByText("CC-2026-1001");
    metric("Total Requests", "2");
    metric("Open Requests", "1");
    metric("Resolved / Closed", "1");
    metric("Overdue Requests", "1");
    metric("Average Resolution", "3.5 h");
    expect(screen.getByText("Live backend reporting")).toBeInTheDocument();
    expect(vi.mocked(getManagementRequests)).toHaveBeenCalledWith(
      "private-test-session", { category: "all", status: "all", page: 1 }, expect.any(AbortSignal),
    );
  });

  it("filters request register by server-side category without misrepresenting summary KPIs", async () => {
    renderWithRole();
    await screen.findByText("CC-2026-1001");
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Service category"), "ROAD_PAVEMENT");
    await waitFor(() => expect(vi.mocked(getManagementRequests)).toHaveBeenCalledWith(
      "private-test-session", { category: "ROAD_PAVEMENT", status: "all", page: 1 }, expect.any(AbortSignal),
    ));
    await screen.findByText("CC-2026-1001");
    metric("Total Requests", "2");
    expect(screen.getByText(/Filters apply only to the request register/)).toBeInTheDocument();
  });

  it("filters by API lifecycle status, then clears filters", async () => {
    renderWithRole();
    await screen.findByText("CC-2026-1001");
    const user = userEvent.setup();
    await user.selectOptions(screen.getByLabelText("Request status"), "RESOLVED");
    await waitFor(() => expect(vi.mocked(getManagementRequests)).toHaveBeenCalledWith(
      "private-test-session", { category: "all", status: "RESOLVED", page: 1 }, expect.any(AbortSignal),
    ));
    await screen.findByText("CC-2026-1001");
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    await waitFor(() => expect(screen.getByLabelText("Request status")).toHaveValue("all"));
  });

  it("shows zero as real data and does not invent an SLA compliance percentage", async () => {
    vi.mocked(getManagementSummary).mockResolvedValue({ ...summary, totals: { all: 0, open: 0, overdue: 0, resolved: 0, closed: 0, rejected: 0 }, byStatus: { SUBMITTED: 0, ASSIGNED: 0, IN_PROGRESS: 0, ON_HOLD: 0, RESOLVED: 0, CLOSED: 0, REJECTED: 0 }, byCategory: [], averageResolutionHours: null });
    vi.mocked(getManagementRequests).mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 20 });
    renderWithRole("ADMIN");
    await screen.findByText("No matching requests.");
    metric("Total Requests", "0");
    metric("Average Resolution", "N/A");
    expect(screen.queryByText("SLA Compliance")).not.toBeInTheDocument();
  });

  it("reports API errors rather than falling back to fictional data, and allows retry", async () => {
    vi.mocked(getManagementSummary).mockRejectedValueOnce(new Error("Forbidden"));
    renderWithRole();
    expect(await screen.findByRole("alert")).toHaveTextContent("Forbidden");
    expect(screen.queryByText("CC-2026-1001")).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "Try again" }));
    await screen.findByText("CC-2026-1001");
  });

  it("does not call a management endpoint for STAFF users", () => {
    renderWithRole("STAFF");
    expect(screen.getByRole("alert")).toHaveTextContent("Access denied");
    expect(getManagementSummary).not.toHaveBeenCalled();
    expect(getManagementRequests).not.toHaveBeenCalled();
  });

  it("honours server pagination rather than assuming all requests are returned", async () => {
    vi.mocked(getManagementRequests).mockResolvedValue({ ...records, total: 42 });
    renderWithRole();
    await screen.findByText("CC-2026-1001");
    await userEvent.setup().click(screen.getByRole("button", { name: "Next page" }));
    await waitFor(() => expect(vi.mocked(getManagementRequests)).toHaveBeenCalledWith(
      "private-test-session", { category: "all", status: "all", page: 2 }, expect.any(AbortSignal),
    ));
  });
});
