import type { LifecycleStage } from "./requestManagementTypes";

// Demo roles only. Real permissions must come from the backend.
export type AssignmentRole = "staff" | "manager" | "requester";

export interface AssignmentOfficer {
  id: string;
  name: string;
  role: string;
  fieldUnit: string;
  crewSummary: string;
}

export interface AssignmentInput {
  currentStage: LifecycleStage;
  userRole: AssignmentRole;
  officerId: string;
}

export type AssignmentResult =
  | { allowed: true; officer: AssignmentOfficer }
  | { allowed: false; reason: string };

// Controlled demonstration list.
// Later, the API should supply the permitted assignment candidates.
export const demoAssignmentOfficers: AssignmentOfficer[] = [
  {
    id: "OFF-001",
    name: "Eleanor Vance",
    role: "Lead Triage Specialist",
    fieldUnit: "Crew Unit #12 (Hydraulic)",
    crewSummary: "3 technicians · Vehicle 991",
  },
  {
    id: "OFF-002",
    name: "Dave Fletcher",
    role: "Field Operations Officer",
    fieldUnit: "Crew Unit #04",
    crewSummary: "4 field technicians",
  },
  {
    id: "OFF-003",
    name: "Tech Lead Ortiz",
    role: "Technical Response Lead",
    fieldUnit: "Crew Unit #21",
    crewSummary: "Specialist response team",
  },
];

/**
 * Evaluates a proposed assignment against frontend business rules.
 *
 * This is NOT a security boundary.
 * The backend must independently enforce authorisation,
 * valid staff identities and permitted request states.
 */
export function validateAssignment(
  input: AssignmentInput,
  officers: AssignmentOfficer[] = demoAssignmentOfficers,
): AssignmentResult {
  // Check the actor first.
  if (input.userRole !== "staff" && input.userRole !== "manager") {
    return {
      allowed: false,
      reason: "You do not have permission to assign requests.",
    };
  }

  // Completed requests cannot be reassigned through this workflow.
  if (input.currentStage === "Closed") {
    return {
      allowed: false,
      reason: "Closed requests cannot be reassigned.",
    };
  }

  const officer = officers.find(
    (candidate) => candidate.id === input.officerId,
  );

  if (!officer) {
    return {
      allowed: false,
      reason: "Select a valid staff member.",
    };
  }

  return {
    allowed: true,
    officer,
  };
}