import { apiRequest } from "../../services/apiClient";
import type { BackendStatus, LiveRequest, RequestPage } from "../staff/live/staffApi";

/** Exact values reported by the current Express management service. */
export interface ManagementSummaryResponse {
  generatedAt: string;
  totals: {
    all: number;
    open: number;
    overdue: number;
    resolved: number;
    closed: number;
    rejected: number;
  };
  byStatus: Record<BackendStatus, number>;
  byCategory: Array<{
    category: string;
    label: string;
    total: number;
    open: number;
    overdue: number;
  }>;
  averageResolutionHours: number | null;
  serviceLevelTargetHours: Record<"LOW" | "MEDIUM" | "HIGH", number>;
}

export interface ManagementFilters {
  category: string;
  status: string;
  page: number;
}

const PAGE_SIZE = 20;

export const MANAGEMENT_STATUSES: readonly BackendStatus[] = [
  "SUBMITTED", "ASSIGNED", "IN_PROGRESS", "ON_HOLD", "RESOLVED", "CLOSED", "REJECTED",
];

export const STATUS_LABELS: Record<BackendStatus, string> = {
  SUBMITTED: "Submitted", ASSIGNED: "Assigned", IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold", RESOLVED: "Resolved", CLOSED: "Closed", REJECTED: "Rejected",
};

/** Real totals are system-wide; UI register filters do not affect summary cards. */
export async function getManagementSummary(token: string, signal?: AbortSignal): Promise<ManagementSummaryResponse> {
  const response = await apiRequest<ManagementSummaryResponse>("/api/management/summary", { token, signal });
  const totals = response?.totals;
  const requiredCounts = ["all", "open", "overdue", "resolved", "closed", "rejected"] as const;
  if (!response || !totals || !requiredCounts.every((key) => Number.isInteger(totals[key]) && totals[key] >= 0) ||
      !response.byStatus || !MANAGEMENT_STATUSES.every((key) => Number.isInteger(response.byStatus[key]) && response.byStatus[key] >= 0) ||
      !Array.isArray(response.byCategory) ||
      !response.byCategory.every((item) => typeof item.category === "string" && typeof item.label === "string" &&
        Number.isInteger(item.total) && Number.isInteger(item.open) && Number.isInteger(item.overdue)) ||
      typeof response.generatedAt !== "string" || !Number.isFinite(Date.parse(response.generatedAt)) ||
      !(response.averageResolutionHours === null || (typeof response.averageResolutionHours === "number" && Number.isFinite(response.averageResolutionHours)))) {
    throw new Error("The management summary response is incomplete.");
  }
  return response;
}

export async function getManagementRequests(
  token: string, filters: ManagementFilters, signal?: AbortSignal,
): Promise<RequestPage> {
  const search = new URLSearchParams({ page: String(filters.page), pageSize: String(PAGE_SIZE) });
  if (filters.category !== "all") search.set("category", filters.category);
  if (filters.status !== "all") search.set("status", filters.status);
  const response = await apiRequest<RequestPage>(`/api/management/requests?${search}`, { token, signal });
  if (!response || !Array.isArray(response.items) ||
      !response.items.every((item) => typeof item.id === "string" && typeof item.reference === "string" &&
        typeof item.category === "string" && typeof item.status === "string" && typeof item.priority === "string" && typeof item.overdue === "boolean") ||
      !Number.isInteger(response.total) || response.total < 0 ||
      !Number.isInteger(response.page) || response.page < 1 ||
      !Number.isInteger(response.pageSize) || response.pageSize < 1) {
    throw new Error("The management register response is incomplete.");
  }
  return response;
}

export function describeServiceLevel(record: Pick<LiveRequest, "status" | "overdue">): string {
  if (["RESOLVED", "CLOSED", "REJECTED"].includes(record.status)) return "Finalised";
  return record.overdue ? "Overdue" : "Within target";
}
