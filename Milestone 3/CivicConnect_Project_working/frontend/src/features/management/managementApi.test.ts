import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "../../services/apiClient";
import {
  describeServiceLevel, getManagementRequests, getManagementSummary,
} from "./managementApi";

vi.mock("../../services/apiClient", () => ({ apiRequest: vi.fn() }));
beforeEach(() => vi.resetAllMocks());

describe("Live management API contract", () => {
  it("includes bearer token and returns the backend summary", async () => {
    const data = { generatedAt: "2026-10-16T09:00:00Z", totals: { all: 0, open: 0, overdue: 0, resolved: 0, closed: 0, rejected: 0 }, byStatus: { SUBMITTED: 0, ASSIGNED: 0, IN_PROGRESS: 0, ON_HOLD: 0, RESOLVED: 0, CLOSED: 0, REJECTED: 0 }, byCategory: [], averageResolutionHours: null };
    vi.mocked(apiRequest).mockResolvedValue(data);
    await expect(getManagementSummary("test-token")).resolves.toBe(data);
    expect(apiRequest).toHaveBeenCalledWith("/api/management/summary", { token: "test-token", signal: undefined });
  });
  it("encodes category and status with pagination in the server request", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ items: [], total: 0, page: 2, pageSize: 20 });
    await getManagementRequests("test-token", { category: "ROAD_PAVEMENT", status: "IN_PROGRESS", page: 2 });
    expect(apiRequest).toHaveBeenCalledWith(
      "/api/management/requests?page=2&pageSize=20&category=ROAD_PAVEMENT&status=IN_PROGRESS",
      { token: "test-token", signal: undefined },
    );
  });
  it("rejects an incomplete backend response instead of showing made-up metrics", async () => {
    vi.mocked(apiRequest).mockResolvedValue({ summary: "wrong API format" });
    await expect(getManagementSummary("test-token")).rejects.toThrow("incomplete");
    await expect(getManagementRequests("test-token", { category: "all", status: "all", page: 1 })).rejects.toThrow("incomplete");
  });
  it("does not call completed or rejected requests overdue", () => {
    expect(describeServiceLevel({ status: "RESOLVED", overdue: false })).toBe("Finalised");
    expect(describeServiceLevel({ status: "REJECTED", overdue: false })).toBe("Finalised");
    expect(describeServiceLevel({ status: "SUBMITTED", overdue: true })).toBe("Overdue");
  });
});
