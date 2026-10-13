
/**
 * CivicConnect — Management Metrics
 *
 * Pure calculations for management oversight.
 * Inputs currently come from demonstration records.
 */

export type ManagementRequestStatus =
  | "Submitted"
  | "In Triage"
  | "In Progress"
  | "Pending Verification"
  | "Resolved"
  | "Closed";

export interface ManagementRequest {
  id: string;
  department: string;
  status: ManagementRequestStatus;
  priority: "Low" | "Medium" | "High" | "Critical";
  slaTargetMinutes: number;
  slaElapsedMinutes: number;
  createdAt: string;
}

export interface DepartmentPerformance {
  department: string;
  total: number;
  open: number;
  completed: number;
  overdue: number;
}

export interface ManagementSummary {
  total: number;
  open: number;
  completed: number;
  overdue: number;
  slaCompliancePercent: number | null;
}

const completedStatuses: ManagementRequestStatus[] = [
  "Resolved",
  "Closed",
];

export function isCompleted(
  status: ManagementRequestStatus,
): boolean {
  return completedStatuses.includes(status);
}

/**
 * Open requests are overdue when elapsed time exceeds
 * their positive SLA target.
 *
 * This is a demonstration metric, not an official SLA policy.
 */
export function isOverdue(
  request: ManagementRequest,
): boolean {
  return (
    !isCompleted(request.status) &&
    request.slaTargetMinutes > 0 &&
    request.slaElapsedMinutes > request.slaTargetMinutes
  );
}

/**
 * SLA compliance counts valid requests that have not
 * exceeded their target.
 *
 * Returns null if no requests have valid SLA values.
 */
export function calculateSummary(
  requests: ManagementRequest[],
): ManagementSummary {
  const validSlaRequests = requests.filter(
    (request) =>
      Number.isFinite(request.slaTargetMinutes) &&
      Number.isFinite(request.slaElapsedMinutes) &&
      request.slaTargetMinutes > 0 &&
      request.slaElapsedMinutes >= 0,
  );

  const compliantRequests = validSlaRequests.filter(
    (request) =>
      request.slaElapsedMinutes <= request.slaTargetMinutes,
  );

  return {
    total: requests.length,
    open: requests.filter(
      (request) => !isCompleted(request.status),
    ).length,
    completed: requests.filter(
      (request) => isCompleted(request.status),
    ).length,
    overdue: requests.filter(isOverdue).length,
    slaCompliancePercent:
      validSlaRequests.length === 0
        ? null
        : Math.round(
            (compliantRequests.length /
              validSlaRequests.length) *
              100,
          ),
  };
}

export function getStatusCounts(
  requests: ManagementRequest[],
): Record<ManagementRequestStatus, number> {
  const counts: Record<ManagementRequestStatus, number> = {
    Submitted: 0,
    "In Triage": 0,
    "In Progress": 0,
    "Pending Verification": 0,
    Resolved: 0,
    Closed: 0,
  };

  for (const request of requests) {
    counts[request.status] += 1;
  }

  return counts;
}

export function getDepartmentPerformance(
  requests: ManagementRequest[],
): DepartmentPerformance[] {
  const departments = new Map<string, DepartmentPerformance>();

  for (const request of requests) {
    const existing = departments.get(request.department) ?? {
      department: request.department,
      total: 0,
      open: 0,
      completed: 0,
      overdue: 0,
    };

    existing.total += 1;

    if (isCompleted(request.status)) {
      existing.completed += 1;
    } else {
      existing.open += 1;
    }

    if (isOverdue(request)) {
      existing.overdue += 1;
    }

    departments.set(request.department, existing);
  }

  return [...departments.values()].sort(
    (first, second) =>
      second.total - first.total ||
      first.department.localeCompare(second.department),
  );
}

export function filterManagementRequests(
  requests: ManagementRequest[],
  department: string,
  status: string,
): ManagementRequest[] {
  return requests.filter(
    (request) =>
      (department === "all" ||
        request.department === department) &&
      (status === "all" || request.status === status),
  );
}
