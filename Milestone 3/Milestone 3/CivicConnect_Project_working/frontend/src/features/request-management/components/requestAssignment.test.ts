import { describe, expect, it } from "vitest";

import {
  validateAssignment,
  demoAssignmentOfficers,
} from "./requestAssignment";

/**
 * Requirement: FR-STF-006
 *
 * Test basis:
 * AC-STF-006-A: Authorised staff can assign responsibility.
 * AC-STF-006-B: Unauthorised assignment attempts are rejected.
 *
 * These are frontend business-rule tests only.
 */
describe("Request assignment validation", () => {
  it("accepts an authorised assignment to a valid officer", () => {
    const result = validateAssignment({
      currentStage: "In Progress",
      userRole: "staff",
      officerId: "OFF-002",
    });

    expect(result.allowed).toBe(true);

    if (result.allowed) {
      expect(result.officer.name).toBe("Dave Fletcher");
    }
  });

  it("rejects an assignment attempted by a requester", () => {
    const result = validateAssignment({
      currentStage: "In Progress",
      userRole: "requester",
      officerId: "OFF-002",
    });

    expect(result).toEqual({
      allowed: false,
      reason: "You do not have permission to assign requests.",
    });
  });

  it("rejects an unknown staff identifier", () => {
    const result = validateAssignment({
      currentStage: "In Progress",
      userRole: "staff",
      officerId: "OFF-UNKNOWN",
    });

    expect(result).toEqual({
      allowed: false,
      reason: "Select a valid staff member.",
    });
  });

  it("rejects reassignment of a closed request", () => {
    const result = validateAssignment({
      currentStage: "Closed",
      userRole: "manager",
      officerId: "OFF-001",
    });

    expect(result.allowed).toBe(false);
  });

  it("returns the correct field-unit information", () => {
    const result = validateAssignment(
      {
        currentStage: "Triaged",
        userRole: "manager",
        officerId: "OFF-003",
      },
      demoAssignmentOfficers,
    );

    expect(result.allowed).toBe(true);

    if (result.allowed) {
      expect(result.officer.fieldUnit).toBe("Crew Unit #21");
    }
  });
});