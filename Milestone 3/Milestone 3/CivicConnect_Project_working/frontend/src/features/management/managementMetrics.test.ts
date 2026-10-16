
import { describe, expect, it } from "vitest";

import {
  calculateSummary,
  filterManagementRequests,
  getDepartmentPerformance,
  getStatusCounts,
  isOverdue,
  type ManagementRequest,
} from "./managementMetrics";

const requests: ManagementRequest[] = [
  {
    id: "R-001",
    department: "Water",
    status: "In Progress",
    priority: "High",
    slaTargetMinutes: 120,
    slaElapsedMinutes: 150,
    createdAt: "2026-10-10T08:00:00+02:00",
  },
  {
    id: "R-002",
    department: "Water",
    status: "Resolved",
    priority: "Medium",
    slaTargetMinutes: 120,
    slaElapsedMinutes: 90,
    createdAt: "2026-10-10T09:00:00+02:00",
  },
  {
    id: "R-003",
    department: "Roads",
    status: "Submitted",
    priority: "Low",
    slaTargetMinutes: 300,
    slaElapsedMinutes: 100,
    createdAt: "2026-10-11T08:00:00+02:00",
  },
];

describe("Management metrics", () => {
  it("calculates total, open and completed request counts", () => {
    const result = calculateSummary(requests);

    expect(result.total).toBe(3);
    expect(result.open).toBe(2);
    expect(result.completed).toBe(1);
  });

  it("identifies overdue open requests", () => {
    expect(isOverdue(requests[0])).toBe(true);
    expect(isOverdue(requests[1])).toBe(false);
    expect(calculateSummary(requests).overdue).toBe(1);
  });

  it("calculates SLA compliance from valid requests", () => {
    expect(
      calculateSummary(requests).slaCompliancePercent,
    ).toBe(67);
  });

  it("returns N/A-compatible values for an empty dataset", () => {
    expect(calculateSummary([])).toEqual({
      total: 0,
      open: 0,
      completed: 0,
      overdue: 0,
      slaCompliancePercent: null,
    });
  });

  it("groups requests into the correct status counts", () => {
    const counts = getStatusCounts(requests);

    expect(counts["In Progress"]).toBe(1);
    expect(counts.Resolved).toBe(1);
    expect(counts.Submitted).toBe(1);
    expect(counts.Closed).toBe(0);
  });

  it("calculates department workload correctly", () => {
    const departments = getDepartmentPerformance(requests);

    expect(departments[0]).toEqual({
      department: "Water",
      total: 2,
      open: 1,
      completed: 1,
      overdue: 1,
    });
  });

  it("filters requests by department and status", () => {
    const results = filterManagementRequests(
      requests,
      "Water",
      "Resolved",
    );

    expect(results.map((request) => request.id)).toEqual([
      "R-002",
    ]);
  });

  it("rejects invalid SLA targets from compliance calculations", () => {
    const invalidRequest: ManagementRequest = {
      ...requests[0],
      id: "R-INVALID",
      slaTargetMinutes: 0,
    };

    const result = calculateSummary([invalidRequest]);

    expect(result.slaCompliancePercent).toBeNull();
    expect(result.overdue).toBe(0);
  });
});
