import { useState } from "react";

import OperationsShell from "../../layouts/OperationsShell";
import RequestForm from "./components/RequestForm";
import RecentSubmissions from "./components/RecentSubmissions";
import TicketTracker from "./components/TicketTracker";

import {
  initialSubmissions,
  type RequestDraft,
  type SubmissionRecord,
} from "./requesterData";

import "./RequesterPortal.css";

export default function RequesterPortal() {
  const [submissions, setSubmissions] =
    useState<SubmissionRecord[]>(initialSubmissions);

  const [nextCaseNumber, setNextCaseNumber] = useState(9282);

  const [submissionNotice, setSubmissionNotice] =
    useState("");

  const activeTicketCount = submissions.filter(
    (submission) => submission.status === "In Progress",
  ).length;

  const handleRequestSubmitted = (
    request: RequestDraft,
  ) => {
    const newCaseId = `CV-${nextCaseNumber}`;

    const newSubmission: SubmissionRecord = {
      caseId: newCaseId,
      category: request.category,
      location: request.location || "Location not provided",
      dateFiled: new Date().toLocaleDateString("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      status: "In Progress",
    };

    setSubmissions((current) => [
      newSubmission,
      ...current,
    ]);

    setNextCaseNumber(
      (current) => current + 1,
    );

    setSubmissionNotice(
      `${newCaseId} was added to the local frontend demonstration record.`,
    );
  };

  return (
    <OperationsShell activeNavigation="requester-self-service">
      <div className="requester-page">
        <div className="requester-page__content">
          <section className="requester-hero">
            <div className="requester-hero__background requester-hero__background--one" />
            <div className="requester-hero__background requester-hero__background--two" />

            <div className="requester-hero__content">
              <div className="requester-hero__copy">
                <span className="portal-status-pill">
                  <span className="portal-status-pill__dot" />
                  CIVIC PORTAL ACTIVE • DISTRICT 04 METRO
                </span>

                <h1>Welcome back, Resident Vance</h1>

                <p>
                  Report urban infrastructure defects, view
                  ongoing municipal remediation, and monitor
                  public works dispatches across your precinct.
                </p>
              </div>

              <div className="requester-hero__metrics">
                <div className="hero-stat">
                  <div className="hero-stat__icon">
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                    >
                      assignment_turned_in
                    </span>
                  </div>

                  <div>
                    <strong>{activeTicketCount}</strong>
                    <span>Active Tickets Filed</span>
                  </div>
                </div>

                <div className="emergency-notice">
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    emergency
                  </span>

                  <div>
                    <strong>Urgent Hazard Notice</strong>

                    <span>
                      Immediate hazard or downed power line?
                    </span>

                    <button
                      type="button"
                      className="emergency-link"
                      onClick={() =>
                        setSubmissionNotice(
                          "For an actual emergency, use the municipality's official emergency contact channel.",
                        )
                      }
                    >
                      Dial Municipal 311
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {submissionNotice && (
            <div
              className="page-notice"
              role="status"
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                info
              </span>

              <span>{submissionNotice}</span>

              <button
                type="button"
                onClick={() => setSubmissionNotice("")}
                aria-label="Dismiss notice"
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  close
                </span>
              </button>
            </div>
          )}

          <div className="requester-grid">
            <RequestForm
              onSubmitted={handleRequestSubmitted}
            />

            <TicketTracker />
          </div>

          <RecentSubmissions
            submissions={submissions}
          />
        </div>
      </div>
    </OperationsShell>
  );
}