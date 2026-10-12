import { useState } from "react";
import RequestOwnershipPanel from "../components/RequestOwnershipPanel";

import OperationsShell from "../../../layouts/OperationsShell";

import RequestLifecycle from "../RequestLifecycle";
import RequestCaseDetails from "../components/RequestCaseDetails";

import { mockRequestManagementCase } from "../components/requestManagementData";

import "./RequestManagementLifecyclePage.css";



// These tabs distinguish staff-only, citizen-facing and audit information.
type ActivityTab = "staff" | "public" | "audit";

/**
 * Formats timestamps consistently for display.
 * Note that formatting is separate from the stored timestamp.
 */
function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Displays a stored SLA amount.
 * Negative values mean that the target has been exceeded.
 */
function formatSlaMinutes(value: number): string {
  const absolute = Math.abs(value);
  const hours = Math.floor(absolute / 60);
  const minutes = absolute % 60;

  const formatted = `${hours}h ${String(minutes).padStart(2, "0")}m`;

  return value < 0
    ? `${formatted} overdue`
    : `${formatted} remaining`;
}

export default function RequestManagementLifecyclePage() {
  // Local demonstration record.
  // Replace with API data when backend integration is ready.
  const caseData = mockRequestManagementCase;

  const [activeTab, setActiveTab] = useState<ActivityTab>("staff");

  const staffMessages = caseData.messages.filter(
    (message) => message.type === "Internal Staff Note",
  );

  const publicMessages = caseData.messages.filter(
    (message) => message.type === "Public Citizen Message",
  );

  const visibleMessages =
    activeTab === "staff" ? staffMessages : publicMessages;

  const slaTarget = Math.max(1, caseData.targetSlaMinutes);

  const elapsedPercentage = Math.min(
    100,
    Math.max(
      0,
      ((slaTarget - caseData.remainingSlaMinutes) / slaTarget) * 100,
    ),
  );

  return (
    <OperationsShell activeNavigation="request-management">
      <div className="rml-page">
        {/* Main heading */}
        <header className="rml-page__header">
          <div>
            <span className="rml-page__eyebrow">
              CIVICCONNECT / REQUEST MANAGEMENT
            </span>

            <h1>Request Lifecycle &amp; Audit</h1>

            <p>
              Case <strong>{caseData.caseReference}</strong> —{" "}
              {caseData.subcategory}
            </p>
          </div>

          <div className="rml-page__header-actions">
            <span className="rml-page__demo-badge">
              Local demo data
            </span>

            <button
              type="button"
              className="rml-button rml-button--secondary"
              onClick={() => window.print()}
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                print
              </span>
              Print View
            </button>

            {/* Disabled until the actual workflow API is connected. */}
            <button
              type="button"
              className="rml-button rml-button--primary"
              disabled
              title="Backend workflow integration required"
            >
              Advance Lifecycle
            </button>
          </div>
        </header>

        {/* Existing lifecycle component */}
        <RequestLifecycle
          currentStage={caseData.currentStage}
          timestamps={caseData.stageTimestamps}
        />

        {/* State clearly what is and isn't implemented. */}
        <div className="rml-page__notice" role="note">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            info
          </span>

          <p>
            This screen uses demonstration data. Backend assignment,
            status changes, message posting and persistent audit
            recording are not yet connected.
          </p>
        </div>

        <div className="rml-page__grid">
          {/* Main case information */}
          <div className="rml-page__main-column">
            <RequestCaseDetails details={caseData} />

            {/* Internal notes, citizen updates and audit history */}
            <section
              className="rml-card rml-activity"
              aria-label="Case activity and audit history"
            >
              <div
                className="rml-activity__tabs"
                role="tablist"
                aria-label="Activity categories"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "staff"}
                  className={activeTab === "staff" ? "is-active" : ""}
                  onClick={() => setActiveTab("staff")}
                >
                  Internal Staff Notes ({staffMessages.length})
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "public"}
                  className={activeTab === "public" ? "is-active" : ""}
                  onClick={() => setActiveTab("public")}
                >
                  Public Citizen Messages ({publicMessages.length})
                </button>

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === "audit"}
                  className={activeTab === "audit" ? "is-active" : ""}
                  onClick={() => setActiveTab("audit")}
                >
                  System Audit Trail ({caseData.auditEvents.length})
                </button>
              </div>

              <div
                className="rml-activity__content"
                role="tabpanel"
                aria-label={
                  activeTab === "staff"
                    ? "Internal staff notes"
                    : activeTab === "public"
                      ? "Public citizen messages"
                      : "System audit trail"
                }
              >
                {activeTab === "audit" ? (
                  caseData.auditEvents.length > 0 ? (
                    <ol className="rml-activity__list">
                      {caseData.auditEvents.map((event) => (
                        <li key={event.id} className="rml-activity__item">
                          <div className="rml-activity__item-heading">
                            <strong>{event.action}</strong>

                            <time dateTime={event.timestamp}>
                              {formatDateTime(event.timestamp)}
                            </time>
                          </div>

                          <span className="rml-activity__author">
                            Actor: {event.actor}
                          </span>

                          <p>{event.details}</p>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>No audit events are available.</p>
                  )
                ) : visibleMessages.length > 0 ? (
                  <ol className="rml-activity__list">
                    {visibleMessages.map((message) => (
                      <li key={message.id} className="rml-activity__item">
                        <div className="rml-activity__item-heading">
                          <strong>{message.author}</strong>

                          <time dateTime={message.timestamp}>
                            {formatDateTime(message.timestamp)}
                          </time>
                        </div>

                        <span className="rml-activity__author">
                          {message.role}
                        </span>

                        <p>{message.content}</p>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p>No messages are available in this category.</p>
                )}
              </div>
            </section>

            {/* Resolution verification */}
            <section className="rml-card rml-resolution">
              <div className="rml-card__heading">
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  fact_check
                </span>

                <h2>Formal Resolution &amp; Closeout Verification</h2>
              </div>

              <div className="rml-resolution__fields">
                <div>
                  <span className="rml-field-label">
                    Root Cause
                  </span>
                  <strong>
                    {caseData.rootCause || "Not recorded"}
                  </strong>
                </div>

                <div>
                  <span className="rml-field-label">
                    Materials &amp; Labour
                  </span>
                  <strong>
                    {caseData.materialsAndLabourCode || "Not recorded"}
                  </strong>
                </div>
              </div>

              <span className="rml-field-label">
                Resolution Summary
              </span>

              <p className="rml-resolution__summary">
                {caseData.resolutionSummary ||
                  "No resolution summary has been recorded."}
              </p>

              <div className="rml-resolution__footer">
                <span>
                  {caseData.supervisorSignoffRequired
                    ? "Supervisor sign-off required"
                    : "Supervisor sign-off not flagged"}
                </span>

                <button
                  type="button"
                  className="rml-button rml-button--primary"
                  disabled
                >
                  Submit for Approval
                </button>
              </div>
            </section>
          </div>

          {/* Right-hand operational panels */}
          <aside
            className="rml-page__side-column"
            aria-label="Case operational information"
          >
            {/* SLA */}
            <section className="rml-card rml-sla">
              <div className="rml-card__heading">
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  timer
                </span>
                <h2>SLA Compliance Window</h2>
              </div>

              <strong className="rml-sla__time">
                {formatSlaMinutes(caseData.remainingSlaMinutes)}
              </strong>

              <div
                className="rml-sla__track"
                role="progressbar"
                aria-label="SLA elapsed percentage"
                aria-valuenow={Math.round(elapsedPercentage)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="rml-sla__fill"
                  style={{ width: `${elapsedPercentage}%` }}
                />
              </div>

              <p>Target: {caseData.targetSlaMinutes} minutes</p>

              <small>
                Calculated from stored demonstration data.
              </small>
            </section>

            {/* Case ownership */}
            <section className="rml-card rml-ownership">
              <RequestOwnershipPanel
                caseReference={caseData.caseReference}
                currentStage={caseData.currentStage}
                initialOwner={caseData.ownerName}
                initialOwnerRole={caseData.ownerRole}
                initialFieldUnit={caseData.activeFieldUnit}
                initialCrewSummary={caseData.crewSummary}
                userRole="staff" // For demonstration, the user is a staff member.
              />
            </section>

            {/* Actions cannot be performed before backend authorisation */}
            <section className="rml-card rml-administration">
              <div className="rml-card__heading">
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  admin_panel_settings
                </span>
                <h2>Administrative Actions</h2>
              </div>

              <p>
                These actions require authenticated staff permissions
                and a connected API.
              </p>

              <button type="button" disabled>
                Contact Requester
              </button>

              <button type="button" disabled>
                Escalate Request
              </button>

              <button type="button" disabled>
                Export Verified Audit Record
              </button>
            </section>
          </aside>
        </div>
      </div>
    </OperationsShell>
  );
}