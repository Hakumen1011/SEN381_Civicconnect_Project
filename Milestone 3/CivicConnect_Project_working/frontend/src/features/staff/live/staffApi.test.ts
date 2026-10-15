import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../../services/apiClient";
import {
  assignToMe,
  changeRequestStatus,
  getStaffAuditTrail,
  listStaffRequests,
  loginStaff,
  statusesStaffMaySet,
  type LiveRequest,
  type StaffSession,
} from "./staffApi";

vi.mock("../../../services/apiClient", () => ({ apiRequest: vi.fn() }));

const request: LiveRequest = {
  id: "99706e33-b424-42c3-b60c-f55db613c827",
  reference: "CC-2026-00008",
  requesterId: "5c154b30-e776-48c4-82e8-b00c14815ba1",
  title: "Street light not working",
  description: "Street lighting is out for the whole block",
  category: "STREET_LIGHTING",
  location: "Town Hall Road",
  priority: "MEDIUM",
  status: "IN_PROGRESS",
  assigneeId: "s1",
  resolution: null,
  dueAt: "2026-10-16T08:00:00Z",
  createdAt: "2026-10-15T08:00:00Z",
  updatedAt: "2026-10-15T09:00:00Z",
  version: 3,
  overdue: false,
};

const staff: StaffSession = {
  token: "test-token",
  user: { id: "s1", name: "Staff Example", email: "staff@example.test", role: "STAFF" },
};

beforeEach(() => vi.resetAllMocks());

describe("Staff API integration contracts", () => {
  it("rejects a requester account even if the login endpoint accepts its password", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({
      ...staff,
      user: { ...staff.user, role: "REQUESTER" },
    });
    await expect(loginStaff("resident@example.test", "demo password")).rejects.toThrow(
      "not authorised for staff operations",
    );
  });

  it("loads real staff requests using a bearer token and a bounded page size", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ items: [request], total: 1, page: 1, pageSize: 100 });
    await expect(listStaffRequests(staff.token)).resolves.toMatchObject({ total: 1 });
    expect(apiRequest).toHaveBeenCalledWith("/api/requests?page=1&pageSize=100", {
      token: "test-token",
    });
  });

  it("self-assigns via the server without using hardcoded officer IDs", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ request: { ...request, status: "ASSIGNED" } });
    await assignToMe(request.id, staff.token);
    expect(apiRequest).toHaveBeenCalledWith(
      `/api/requests/${request.id}/assignment`,
      { method: "PUT", token: "test-token", body: {} },
    );
  });

  it("sends optimistic version and required note on a valid resolution transition", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ request: { ...request, status: "RESOLVED" } });
    await changeRequestStatus(request, "RESOLVED", "Street lamp replaced", staff.token);
    expect(apiRequest).toHaveBeenCalledWith(
      `/api/requests/${request.id}/status`,
      { method: "PUT", token: "test-token", body: {
        status: "RESOLVED", note: "Street lamp replaced", expectedVersion: 3,
      } },
    );
  });

  it("rejects an invalid status jump and a resolution without a note before issuing HTTP", async () => {
    await expect(changeRequestStatus(request, "CLOSED", "", staff.token)).rejects.toThrow("Invalid transition");
    await expect(changeRequestStatus(request, "RESOLVED", " ", staff.token)).rejects.toThrow("note is required");
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("does not offer closure to regular staff and blocks actions on unowned requests", () => {
    expect(statusesStaffMaySet({ ...request, status: "RESOLVED" }, staff)).toEqual(["IN_PROGRESS"]);
    expect(statusesStaffMaySet({ ...request, assigneeId: "some-other-staff" }, staff)).toEqual([]);
    expect(statusesStaffMaySet({ ...request, status: "RESOLVED" }, {
      ...staff, user: { ...staff.user, role: "MANAGER" },
    })).toEqual(["CLOSED", "IN_PROGRESS"]);
  });

  it("requests the audit history from the actual staff-only endpoint", async () => {
    vi.mocked(apiRequest).mockResolvedValueOnce({ request, history: [], actions: [] });
    await getStaffAuditTrail(request.id, staff.token);
    expect(apiRequest).toHaveBeenCalledWith(`/api/requests/${request.id}/history`, {
      token: "test-token",
    });
  });
});
