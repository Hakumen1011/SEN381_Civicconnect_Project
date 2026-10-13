import type { RequestStatus } from "../../staff/components/staffTypes.ts";

// The lifecycle order shown in the Request Management Stitch screen.
// Pending Verification is a distinct step before formal resolution.
export type LifecycleStage =
  | "Submitted"
  | "Triaged"
  | "In Progress"
  | "Pending Verification"
  | "Resolved"
  | "Closed";

// Identifies which conversation stream a message belongs to.
export type CaseMessageType =
  | "Internal Staff Note"
  | "Public Citizen Message";

// Records an action performed on a case.
// Actor, timestamp and description are important for auditability.
export interface CaseAuditEvent {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
  details: string;
}

// Staff notes and public messages must remain distinguishable.
export interface CaseMessage {
  id: string;
  type: CaseMessageType;
  author: string;
  role: string;
  timestamp: string;
  content: string;
}

// Details specific to the full Request Management view.
// ServiceRequest remains the shared basic request model used by Staff.
export interface RequestManagementDetails {
  caseReference: string;
  subcategory: string;
  routingDepartment: string;
  origin: string;
  constituentNarrative: string;

  // Coordinates are optional because not every request has a verified geotag.
  latitude: number | null;
  longitude: number | null;

  currentStage: LifecycleStage;

  // Maps each lifecycle stage to a recorded timestamp, if available.
  stageTimestamps: Partial<Record<LifecycleStage, string>>;

  ownerName: string;
  ownerRole: string;
  activeFieldUnit: string | null;

  // This is contextual sample data, not a live dispatch feed.
  crewSummary: string;

  targetSlaMinutes: number;
  remainingSlaMinutes: number;

  messages: CaseMessage[];
  auditEvents: CaseAuditEvent[];

  rootCause: string;
  materialsAndLabourCode: string;
  resolutionSummary: string;
  supervisorSignoffRequired: boolean;
}

// Explicitly model allowed stage changes rather than permitting
// arbitrary movement through the lifecycle.
export const allowedStageTransitions: Record<
  LifecycleStage,
  LifecycleStage[]
> = {
  Submitted: ["Triaged"],
  Triaged: ["In Progress"],
  "In Progress": ["Pending Verification"],
  "Pending Verification": ["In Progress", "Resolved"],
  Resolved: ["Closed"],
  Closed: [],
};
/**
 * Checks whether a requested lifecycle transition is permitted.
 * Supports FR-STF-007.
 */
export function canTransitionTo(
  currentStage: LifecycleStage,
  nextStage: LifecycleStage,
): boolean {
  return allowedStageTransitions[currentStage].includes(nextStage);
}

/**
 * Returns the permitted next lifecycle stages.
 */
export function getAllowedNextStages(
  currentStage: LifecycleStage,
): LifecycleStage[] {
  return allowedStageTransitions[currentStage];
}

// Keep this mapping explicit. The shared Staff status model and the
// detailed lifecycle model have slightly different terminology.
export function toRequestStatus(
  stage: LifecycleStage,
): RequestStatus {
  switch (stage) {
    case "Submitted":
      return "Submitted";

    case "Triaged":
      return "In Triage";

    case "In Progress":
      return "In Progress";

    case "Pending Verification":
      return "Pending Verification";

    case "Resolved":
      return "Resolved";

    case "Closed":
      return "Closed";
  }
}