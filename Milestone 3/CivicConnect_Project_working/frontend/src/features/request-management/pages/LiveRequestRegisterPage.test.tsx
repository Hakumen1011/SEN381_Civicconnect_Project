import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../../auth/AuthContext";
import { apiRequest } from "../../../services/apiClient";
import { getStaffAuditTrail, type LiveRequest } from "../../staff/live/staffApi";
import LiveRequestRegisterPage from "./LiveRequestRegisterPage";

vi.mock("../../../services/apiClient", () => ({ apiRequest: vi.fn() }));
vi.mock("../../staff/live/staffApi", () => ({ getStaffAuditTrail: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

const request: LiveRequest = {
  id: "request-1", reference: "CC-2026-5001", title: "Pothole at main road", category: "ROAD_PAVEMENT",
  location: "Main Road", status: "IN_PROGRESS", priority: "HIGH", dueAt: "2026-10-17T12:00:00Z",
  assigneeId: "staff-1", overdue: false, requesterId: "resident-1", description: "Road damage",
  resolution: null, createdAt: "2026-10-16T12:00:00Z", updatedAt: "2026-10-16T12:00:00Z", version: 3,
};
function showPage() {
  return render(<MemoryRouter><AuthProvider initialSession={{ token: "staff-token", user: {
    id: "staff-1", name: "Demo Staff", email: "staff@civicconnect.local", role: "STAFF",
  } }}><LiveRequestRegisterPage /></AuthProvider></MemoryRouter>);
}

describe("Live request register", () => {
  it("retrieves real backend records and labels paginated metrics accurately", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [request], total: 7, page: 1, pageSize: 20 });
    showPage();
    expect(await screen.findByText("CC-2026-5001")).toBeInTheDocument();
    expect(screen.getByText("Pothole at main road")).toBeInTheDocument();
    expect(screen.getByText("Matching backend requests")).toBeInTheDocument();
    expect(screen.getByText("Not a system-wide overdue count")).toBeInTheDocument();
    expect(apiRequest).toHaveBeenCalledWith("/api/requests?page=1&pageSize=20", { token: "staff-token" });
  });

  it("uses the backend status filter and displays an authenticated history", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [request], total: 1, page: 1, pageSize: 20 });
    vi.mocked(getStaffAuditTrail).mockResolvedValue({ request, history: [{
      id: "event-1", fromStatus: "ASSIGNED", toStatus: "IN_PROGRESS", changedByName: "Demo Staff", changedAt: "2026-10-16T12:10:00Z", note: "Repair started",
    }], actions: [] });
    showPage();
    await screen.findByText("CC-2026-5001");
    fireEvent.change(screen.getByLabelText("Lifecycle status"), { target: { value: "IN_PROGRESS" } });
    await waitFor(() => expect(apiRequest).toHaveBeenCalledWith(
      "/api/requests?page=1&pageSize=20&status=IN_PROGRESS", { token: "staff-token" },
    ));
    fireEvent.click(await screen.findByRole("button", { name: "View history" }));
    expect(await screen.findByRole("heading", { name: "History for CC-2026-5001" })).toBeInTheDocument();
    expect(getStaffAuditTrail).toHaveBeenCalledWith("request-1", "staff-token");
  });

  it("displays a backend error instead of substituting fictional requests", async () => {
    vi.mocked(apiRequest).mockRejectedValue(new Error("Server offline"));
    showPage();
    expect(await screen.findByRole("alert")).toHaveTextContent("Server offline");
    expect(screen.queryByText("CC-2026-5001")).not.toBeInTheDocument();
    expect(screen.queryByText("Matching backend requests")).not.toBeInTheDocument();
  });
});
