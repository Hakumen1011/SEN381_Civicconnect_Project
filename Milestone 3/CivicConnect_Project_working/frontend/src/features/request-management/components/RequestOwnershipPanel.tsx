import { useState } from "react";

import {
  demoAssignmentOfficers,
  validateAssignment,
  type AssignmentOfficer,
  type AssignmentRole,
} from "./requestAssignment";

import type { LifecycleStage } from "./requestManagementTypes";

import "./RequestOwnershipPanel.css";

interface RequestOwnershipPanelProps {
  caseReference: string;
  currentStage: LifecycleStage;
  initialOwner: string;
  initialOwnerRole: string;
  initialFieldUnit: string | null;
  initialCrewSummary: string;
  userRole: AssignmentRole;
}

export default function RequestOwnershipPanel({
  caseReference,
  currentStage,
  initialOwner,
  initialOwnerRole,
  initialFieldUnit,
  initialCrewSummary,
  userRole,
}: RequestOwnershipPanelProps) {
  // Local state allows the UI to demonstrate an assignment.
  // Nothing is persisted or shared with other pages yet.
  const [owner, setOwner] = useState(initialOwner);
  const [ownerRole, setOwnerRole] = useState(initialOwnerRole);
  const [fieldUnit, setFieldUnit] = useState(initialFieldUnit);
  const [crewSummary, setCrewSummary] = useState(initialCrewSummary);

  const [selectedOfficerId, setSelectedOfficerId] = useState("");
  const [feedback, setFeedback] = useState("");

  const canOpenAssignment =
    userRole === "staff" || userRole === "manager";

  function handleAssign() {
    const result = validateAssignment({
      currentStage,
      userRole,
      officerId: selectedOfficerId,
    });

    if (!result.allowed) {
      setFeedback(result.reason);
      return;
    }

    const officer: AssignmentOfficer = result.officer;

    // Update only the local component state.
    setOwner(officer.name);
    setOwnerRole(officer.role);
    setFieldUnit(officer.fieldUnit);
    setCrewSummary(officer.crewSummary);

    setFeedback(
      `Demo assignment updated for ${caseReference}. ` +
        "This change has not been saved to the server.",
    );
  }

  return (
    <section
      className="request-ownership"
      aria-labelledby="request-ownership-title"
    >
      <div className="request-ownership__header">
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
        >
          badge
        </span>

        <h2 id="request-ownership-title">
          Case Ownership
        </h2>
      </div>

      <div className="request-ownership__officer">
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
        >
          account_circle
        </span>

        <div>
          <strong>{owner}</strong>
          <p>{ownerRole}</p>
        </div>
      </div>

      <div className="request-ownership__details">
        <span>Assigned Field Unit</span>
        <strong>{fieldUnit || "Not assigned"}</strong>

        <p>{crewSummary || "Crew details unavailable"}</p>
      </div>

      <div className="request-ownership__form">
        <label htmlFor="request-assignment-officer">
          Assign Responsible Officer
        </label>

        <select
          id="request-assignment-officer"
          value={selectedOfficerId}
          onChange={(event) => {
            setSelectedOfficerId(event.target.value);
            setFeedback("");
          }}
          disabled={!canOpenAssignment || currentStage === "Closed"}
        >
          <option value="">Select staff member</option>

          {demoAssignmentOfficers.map((officer) => (
            <option key={officer.id} value={officer.id}>
              {officer.name} — {officer.role}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleAssign}
          disabled={!canOpenAssignment || currentStage === "Closed"}
        >
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            assignment_ind
          </span>

          Apply Demo Assignment
        </button>

        {feedback && (
          <p className="request-ownership__feedback" role="status">
            {feedback}
          </p>
        )}
      </div>

      <p className="request-ownership__disclaimer">
        Demonstration mode: assignment changes are temporary.
        Backend authorisation, persistence and audit recording
        are not connected.
      </p>
    </section>
  );
}