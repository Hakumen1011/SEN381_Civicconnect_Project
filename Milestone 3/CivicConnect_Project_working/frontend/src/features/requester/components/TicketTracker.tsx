import { useState } from "react";
import {
  initialTicketSteps,
} from "../requesterData";

interface TicketTrackerProps {
  caseId?: string;
}

export default function TicketTracker({
  caseId = "CV-9281",
}: TicketTrackerProps) {
  const [lookupValue, setLookupValue] = useState(caseId);
  const [trackedCase, setTrackedCase] = useState(caseId);
  const [message, setMessage] = useState("");

  const handleTrack = () => {
    const normalisedCase = lookupValue.trim().toUpperCase();

    if (!normalisedCase) {
      setMessage("Enter a case ID before tracking.");
      return;
    }

    setTrackedCase(normalisedCase);
    setMessage(`Now tracking ${normalisedCase}.`);
  };

  const handleShare = async () => {
    const trackingLink =
      `${window.location.origin}${window.location.pathname}` +
      `?case=${encodeURIComponent(trackedCase)}`;

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(trackingLink);
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
              setLookupValue(event.target.value.toUpperCase())
            }
            placeholder="e.g. CV-9281"
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

      <section className="tracked-ticket-card">
        <div className="tracked-ticket__header">
          <div>
            <div className="tracked-ticket__case-row">
              <span className="tracked-ticket__case-id">
                {trackedCase}
              </span>

              <span className="priority-badge">
                Priority II
              </span>
            </div>

            <h3>
              Deep Asphalt Fissure &amp; Pothole Hazard
            </h3>

            <p className="tracked-ticket__location">
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                location_on
              </span>

              1400 block of Oakridge Terrace, West Lane
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
                      <span>{step.timestamp}</span>
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
        </div>

        <div className="dispatcher-log">
          <div className="dispatcher-log__header">
            <strong>
              <span
                className="material-symbols-outlined"
                aria-hidden="true"
              >
                forum
              </span>

              Official Dispatcher Log
            </strong>

            <span>Updated 22 mins ago</span>
          </div>

          <p>
            “Unit #12 has cordoned the right-turn ingress on
            Oakridge. Foundation graded and sub-base compacted.
            Seal coat application scheduled before 16:30 today.”
          </p>

          <div className="dispatcher-log__footer">
            <span>
              Field Officer: <strong>Sgt. D. Martinez</strong>
            </span>

            <span>
              Est. Completion: <strong>Today, 5:00 PM</strong>
            </span>
          </div>
        </div>

        <div className="ticket-actions">
          <button
            type="button"
            className="button button--secondary ticket-actions__button"
            disabled
            title="Backend callback workflow not connected yet"
          >
            Request Callback
          </button>

          <button
            type="button"
            className="button button--primary ticket-actions__button"
            disabled
            title="SMS integration is not connected yet"
          >
            Subscribe to SMS Alerts
          </button>
        </div>
      </section>

      <section className="neighborhood-notice">
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
        >
          traffic
        </span>

        <div>
          <h3>Scheduled Sweeper Notice: Sector 4</h3>

          <p>
            Seasonal street sweeping along Meridian Ave and
            arterial corridors begins tomorrow between 07:00
            and 11:00 AM. Please relocate curbside vehicles.
          </p>
        </div>
      </section>
    </div>
  );
}