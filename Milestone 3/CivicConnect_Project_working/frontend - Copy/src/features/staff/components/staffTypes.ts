// Defines the statuses a service request can move through.
// These are UI/domain types, not a replacement for backend rules.
export type RequestStatus =
  | "Submitted"
  | "In Triage"
  | "In Progress"
  | "Pending Info"
  | "Pending Verification"
  | "Escalated"
  | "Resolved"
  | "Closed";

// P1 is the most urgent priority; P4 is the least urgent.
export type RequestPriority =
  | "P1 Critical"
  | "P2 High"
  | "P3 Medium"
  | "P4 Low";

// Use one consistent category list across Staff and Management.
export type RequestCategory =
  | "Roads & Pavement"
  | "Street Lighting"
  | "Water & Drainage"
  | "Sanitation & Waste"
  | "Parks & Forestry"
  | "Other";

// Describes the data needed to display and manage a service request.
export interface ServiceRequest {
  caseReference: string;
  category: RequestCategory;
  title: string;
  location: string;
  ward: string;

  // Demo requester name only; real requester data must come from the API.
  reportedBy: string;

  // ISO date-time format makes sorting and later API mapping easier.
  reportedAt: string;

  status: RequestStatus;
  priority: RequestPriority;

  // SLA values are stored in minutes so the UI can calculate progress.
  slaTargetMinutes: number;

  // A negative value means the SLA has been exceeded.
  slaMinutesRemaining: number;

  // Null indicates that the request has not yet been assigned.
  assignedOfficer: string | null;
  assignedUnitId: string | null;
}

// A field unit can be available, travelling, or at capacity.
export type CrewAvailability =
  | "Available"
  | "On Route"
  | "At Capacity";

export interface FieldCrewUnit {
  id: string;
  name: string;
  department: string;
  availability: CrewAvailability;
  assignedTaskCount: number;
  taskCapacity: number;
}

// These identifiers will support the Staff Triage quick-view filters.
export type StaffQuickView =
  | "all"
  | "immediate-triage"
  | "sla-risk"
  | "unassigned"
  | "my-units"
  | "escalated";