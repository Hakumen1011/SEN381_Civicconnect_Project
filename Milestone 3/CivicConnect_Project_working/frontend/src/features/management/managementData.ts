
import type { ManagementRequest } from "./managementMetrics";

/**
 * Demonstration data for dashboard development and testing.
 *
 * These records are fictional. Replace them with the
 * management reporting API when backend integration is ready.
 */
export const mockManagementRequests: ManagementRequest[] = [
  {
    id: "CC-2026-1001",
    department: "Water Services",
    status: "In Progress",
    priority: "Critical",
    slaTargetMinutes: 240,
    slaElapsedMinutes: 310,
    createdAt: "2026-10-08T08:00:00+02:00",
  },
  {
    id: "CC-2026-1002",
    department: "Road Maintenance",
    status: "Submitted",
    priority: "Medium",
    slaTargetMinutes: 480,
    slaElapsedMinutes: 120,
    createdAt: "2026-10-09T09:00:00+02:00",
  },
  {
    id: "CC-2026-1003",
    department: "Electricity",
    status: "Resolved",
    priority: "High",
    slaTargetMinutes: 180,
    slaElapsedMinutes: 150,
    createdAt: "2026-10-09T11:30:00+02:00",
  },
  {
    id: "CC-2026-1004",
    department: "Water Services",
    status: "In Triage",
    priority: "High",
    slaTargetMinutes: 300,
    slaElapsedMinutes: 190,
    createdAt: "2026-10-10T08:15:00+02:00",
  },
  {
    id: "CC-2026-1005",
    department: "Waste Management",
    status: "Closed",
    priority: "Low",
    slaTargetMinutes: 720,
    slaElapsedMinutes: 500,
    createdAt: "2026-10-10T13:00:00+02:00",
  },
  {
    id: "CC-2026-1006",
    department: "Road Maintenance",
    status: "Pending Verification",
    priority: "High",
    slaTargetMinutes: 360,
    slaElapsedMinutes: 420,
    createdAt: "2026-10-11T08:45:00+02:00",
  },
  {
    id: "CC-2026-1007",
    department: "Electricity",
    status: "In Progress",
    priority: "Critical",
    slaTargetMinutes: 120,
    slaElapsedMinutes: 170,
    createdAt: "2026-10-11T10:30:00+02:00",
  },
  {
    id: "CC-2026-1008",
    department: "Waste Management",
    status: "Resolved",
    priority: "Medium",
    slaTargetMinutes: 540,
    slaElapsedMinutes: 420,
    createdAt: "2026-10-11T14:00:00+02:00",
  },
];
