import { describe, expect, it } from "vitest";

import {
  canTransitionTo,
  getAllowedNextStages,
} from "../request-management/components/requestManagementTypes";

/**
 * Requirement basis:
 * FR-STF-007 - Status changes must follow defined workflow transitions.
 *
 * These tests exercise business behaviour rather than visual presentation.
 */
describe("Request lifecycle transition rules", () => {
  it("allows a valid transition from Submitted to Triaged", () => {
    // Arrange
    const currentStage = "Submitted";
    const requestedStage = "Triaged";

    // Act
    const result = canTransitionTo(
      currentStage,
      requestedStage,
    );

    // Assert
    expect(result).toBe(true);
  });

  it("rejects an invalid transition from Submitted directly to Resolved", () => {
    // This is an important negative workflow test.
    const result = canTransitionTo(
      "Submitted",
      "Resolved",
    );

    expect(result).toBe(false);
  });

  it("does not allow a Closed request to move to another stage", () => {
    // Closed is the terminal state in our defined workflow.
    const result = getAllowedNextStages("Closed");

    expect(result).toEqual([]);
  });

  it("allows Pending Verification to return to In Progress", () => {
    // Verification may discover that more work is required.
    const result = canTransitionTo(
      "Pending Verification",
      "In Progress",
    );

    expect(result).toBe(true);
  });

  it("allows Pending Verification to progress to Resolved", () => {
    const result = canTransitionTo(
      "Pending Verification",
      "Resolved",
    );

    expect(result).toBe(true);
  });
});