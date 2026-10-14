
import { useEffect, useState } from "react";

import {
  initialSubmissions,
  initialTicketSteps,
  type SubmissionRecord,
} from "../requesterData";

interface TicketTrackerProps {
  submissions?: SubmissionRecord[];
  caseId?: string;
}

/**
 * Normalise case IDs for case-insensitive lookups.
 */
function normaliseCaseId(value: string): string {
  return value.trim().toUpperCase();
}

/**
 * Find a known request in the current local dataset.
 *
 * No backend service is called at this stage.
 */
function findSubmission(
  submissions: SubmissionRecord[],
  caseId: string,
): SubmissionRecord | undefined {
  const normalised = normaliseCaseId(caseId);

  return submissions.find(
    (submission) =>
      normaliseCaseId(submission.caseId) === normalised,
  );
}

/**
 * CivicConnect Requester Ticket Tracker.
 *
 * Important:
 * - Searches local demonstration records.
 * - Does not claim to retrieve live municipal cases.
 * - Only CV-9281 has the historical sample workflow.
 */
export default function TicketTracker({
  submissions = initialSubmissions,
  caseId,
}: TicketTrackerProps) {
  const getInitialCaseId = () => {
    const sharedCaseId = new URLSearchParams(
      window.location.search,
    ).get("case");

    return normaliseCaseId(
      sharedCaseId ||
        caseId ||
        submissions[0]?.caseId ||
        "",
    );
  };

  const [lookupValue, setLookupValue] = useState(
    getInitialCaseId,
  );

  const [trackedCaseId, setTrackedCaseId] = useState<
    string | null
  >(getInitialCaseId);

  const [message, setMessage] = useState("");

  /**
   * When the parent portal creates a new demonstration
   * request, select that request automatically.
   *
   * Preserve an explicitly shared ?case= reference
   * on the initial page load.
   */
  useEffect(() => {
    const sharedCaseId = new URLSearchParams(
      window.location.search,
    ).get("case");

    if (sharedCaseId || !caseId) {
      return;
    }

    const normalised = normaliseCaseId(caseId);

    setLookupValue(normalised);
    setTrackedCaseId(normalised);
    setMessage("");
  }, [caseId]);

  const trackedCase = trackedCaseId
    ? findSubmission(submissions, trackedCaseId)
    : undefined;

  const isSampleCase =
    trackedCase?.caseId === "CV-9281";

  /**
   * Validate a lookup before displaying any case details.
   *
   * An unknown case must not display details belonging
   * to the previously selected case.
   */
  const handleTrack = () => {
    const requestedId = normaliseCaseId(lookupValue);

    if (!requestedId) {
      setTrackedCaseId(null);
      setMessage("Enter a case ID before tracking.");
      return;
    }

    const matchingSubmission = findSubmission(
      submissions,
      requestedId,
    );

    if (!matchingSubmission) {
      setTrackedCaseId(null);

      setMessage(
        `Case ${requestedId} was not found in your loaded requests.`,
      );

      return;
    }

    setTrackedCaseId(matchingSubmission.caseId);
    setLookupValue(matchingSubmission.caseId);

    setMessage(
      `Now tracking ${matchingSubmission.caseId}.`,
    );
  };

  /**
   * Share the selected demonstration case reference.
   *
   * This does not grant access to a real backend case.
   */
  const handleShare = async () => {
    if (!trackedCase) {
      return;
    }

    const trackingUrl = new URL(window.location.href);

    trackingUrl.pathname = "/requester-self-service";
    trackingUrl.searchParams.set(
      "case",
      trackedCase.caseId,
    );

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(
        trackingUrl.toString(),
      );

      setMessage("Tracking link copied to clipboard.");
    } catch {
      setMessage(
        "Tracking link could not be copied automatically.",
      );
    }
  };

  return (
    <div className="tracker-column">
      <section className="lookup-card">
        <label
          htmlFor="ticketLookup"
          className="form-label lookup-card__label"
        >
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            saved_search
          </span>

          Lookup Municipal Ticket by Case ID
        </label>

        <div className="lookup-card__row">
          <input
            id="ticketLookup"
            type="text"
            value={lookupValue}
            onChange={(event) =>
              setLookupValue(
                event.target.value.toUpperCase(),
              )
            }
            placeholder="e.g. CC-2026-000001"
            aria-label="Ticket case ID"
          />

          <button
            type="button"
            className="button button--secondary-blue"
            onClick={handleTrack}
          >
            Track

            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              arrow_forward
            </span>
          </button>
        </div>

        {message && (
          <p className="tracker-message" role="status">
            {message}
          </p>
        )}
      </section>

      {trackedCase ? (
        <section
          className="tracked-ticket-card"
          aria-label="Tracked service request"
        >
          <div className="tracked-ticket__header">
            <div>
              <div className="tracked-ticket__case-row">
                <span className="tracked-ticket__case-id">
                  {trackedCase.caseId}
                </span>

                {isSampleCase && (
                  <span className="priority-badge">
                    Priority II
                  </span>
                )}
              </div>

              <h3>
                {trackedCase.title ||
                  (isSampleCase
                    ? "Deep Asphalt Fissure & Pothole Hazard"
                    : trackedCase.category)}
              </h3>

              <p className="tracked-ticket__location">
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                >
                  location_on
                </span>

                {trackedCase.location}
              </p>

              <p>
                Current status:{" "}
                <strong>{trackedCase.status}</strong>
              </p>

              <p>
                Filed: {trackedCase.dateFiled}
              </p>
            </div>

            <button
              type="button"
              className="small-action-button"
              onClick={handleShare}
              aria-label="Share tracking link"
              title="Share tracking link"
            >
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                share
              </span>
            </button>
          </div>

          <div className="workflow">
            <span className="eyebrow-label">
              Remediation Status Workflow
            </span>

            {isSampleCase ? (
              <>
                <p>
                  Demonstration event history for CV-9281.
                </p>

                <div className="workflow__steps">
                  {initialTicketSteps.map((step) => (
                    <div
                      key={step.title}
                      className={`workflow-step workflow-step--${step.state}`}
                    >
                      <div className="workflow-step__marker">
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                        >
                          {step.icon}
                        </span>
                      </div>

                      <div className="workflow-step__content">
                        <div className="workflow-step__heading">
                          <strong>{step.title}</strong>

                          {step.timestamp && (
                            <span>
                              {step.timestamp}
                            </span>
                          )}

                          {step.state === "active" && (
                            <span className="status-badge status-badge--progress">
                              In Progress
                            </span>
                          )}
                        </div>

                        <p>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p>
                No detailed event history is available
                for this demonstration case.
              </p>
            )}
          </div>

          {isSampleCase && (
            <div className="dispatcher-log">
              <div className="dispatcher-log__header">
                <strong>
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    forum
                  </span>

                  Sample Dispatcher Log
                </strong>
              </div>

              <p>
                Demonstration entry: The assigned road
                maintenance crew is working on the
                reported pothole repair.
              </p>
            </div>
          )}
        </section>
      ) : (
        <section
          className="tracked-ticket-card"
          aria-label="No tracked service request"
        >
          <h3>No case selected</h3>

          <p>
            Enter a valid case reference from your
            demonstration submissions to view its status.
          </p>
        </section>
      )}
    </div>
  );
}
