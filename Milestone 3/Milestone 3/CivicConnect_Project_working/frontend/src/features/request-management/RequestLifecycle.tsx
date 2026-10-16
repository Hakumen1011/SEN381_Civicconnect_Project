import type {
  LifecycleStage,
} from "../request-management/components/requestManagementTypes";

import "./RequestLifecycle.css";

// Stages are listed in the sequence shown in the Stitch design.
const lifecycleStages: LifecycleStage[] = [
  "Submitted",
  "Triaged",
  "In Progress",
  "Pending Verification",
  "Resolved",
  "Closed",
];

interface RequestLifecycleProps {
  currentStage: LifecycleStage;
  timestamps: Partial<Record<LifecycleStage, string>>;
}

function formatStageTimestamp(value?: string): string {
  if (!value) {
    return "Awaiting transition";
  }

  const date = new Date(value);

  // Do not display an invalid timestamp as a real event.
  if (Number.isNaN(date.getTime())) {
    return "Timestamp unavailable";
  }

  return date.toLocaleString("en-ZA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
// The RequestLifecycle component is a visual representation of the lifecycle of a service request.
export default function RequestLifecycle({
  currentStage,
  timestamps,
}: RequestLifecycleProps) {
  const currentIndex = lifecycleStages.indexOf(currentStage);

  return (
    <section
      className="request-lifecycle"
      aria-label="Request lifecycle state machine"
    >
      <header className="request-lifecycle__header">
        <div>
          <span className="request-lifecycle__eyebrow">
            Civic Request Lifecycle State Machine
          </span>

          <h2>Request Progression</h2>
        </div>

        <span className="request-lifecycle__current">
          Currently active: {currentStage}
        </span>
      </header>

        // The ordered list is used to convey the sequence of stages.
       
      <ol className="request-lifecycle__stages">
        {lifecycleStages.map((stage, index) => {
          const isCurrent = stage === currentStage;
          const isComplete = index < currentIndex;
          const isUpcoming = index > currentIndex;

          // CSS uses these classes to distinguish past, current and
          // upcoming stages without relying on colour alone.
          const stageClass = isCurrent
            ? "is-current"
            : isComplete
              ? "is-complete"
              : "is-upcoming";

          return (
            <li
              key={stage}
              className={`request-lifecycle__stage ${stageClass}`}
              aria-current={isCurrent ? "step" : undefined}
            >
              <div className="request-lifecycle__stage-heading">
                <span className="request-lifecycle__stage-number">
                  {String(index + 1).padStart(2, "0")}.
                </span>

                <span className="request-lifecycle__stage-title">
                  {stage}
                </span>

                <span
                  className="material-symbols-outlined request-lifecycle__stage-icon"
                  aria-hidden="true"
                >
                  {isComplete
                    ? "check"
                    : isCurrent
                      ? "radio_button_checked"
                      : "radio_button_unchecked"}
                </span>
              </div>

              <p className="request-lifecycle__timestamp">
                {formatStageTimestamp(timestamps[stage])}
              </p>

              {isCurrent && (
                <span className="request-lifecycle__active-label">
                  Current stage
                </span>
              )}

              {isUpcoming && (
                <span className="request-lifecycle__upcoming-label">
                  Not reached
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}