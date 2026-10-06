import { useMemo, useState } from "react";
import type { SubmissionRecord } from "../requesterData";

interface RecentSubmissionsProps {
  submissions: SubmissionRecord[];
}

function getStatusClass(
  status: SubmissionRecord["status"],
): string {
  switch (status) {
    case "In Progress":
      return "submission-status submission-status--progress";

    case "Resolved":
      return "submission-status submission-status--resolved";

    case "Closed":
      return "submission-status submission-status--closed";

    default:
      return "submission-status";
  }
}

function getCategoryIcon(category: string): string {
  if (category.includes("Road")) {
    return "alt_route";
  }

  if (category.includes("Parks")) {
    return "park";
  }

  if (category.includes("Waste")) {
    return "delete_sweep";
  }

  return "assignment";
}

export default function RecentSubmissions({
  submissions,
}: RecentSubmissionsProps) {
  const [activeOnly, setActiveOnly] = useState(false);
  const [message, setMessage] = useState("");

  const visibleSubmissions = useMemo(() => {
    if (!activeOnly) {
      return submissions;
    }

    return submissions.filter(
      (submission) => submission.status === "In Progress",
    );
  }, [activeOnly, submissions]);

  const handleStatement = () => {
    setMessage(
      "Statement generation will be connected to the backend document service.",
    );
  };

  return (
    <section className="submission-card">
      <div className="submission-card__header">
        <div>
          <span className="eyebrow-label">
            Activity Log
          </span>

          <h2>Your Recent Submissions</h2>
        </div>

        <div className="submission-card__actions">
          <button
            type="button"
            className="button button--light"
            onClick={handleStatement}
          >
            Download Statement (.PDF)
          </button>

          <button
            type="button"
            className={`small-action-button ${
              activeOnly ? "is-active" : ""
            }`}
            onClick={() => setActiveOnly((current) => !current)}
            aria-label="Filter active submissions"
            title="Filter active submissions"
          >
            <span
              className="material-symbols-outlined"
              aria-hidden="true"
            >
              filter_list
            </span>
          </button>
        </div>
      </div>

      {message && (
        <p className="submission-card__message" role="status">
          {message}
        </p>
      )}

      <div className="submission-table-wrapper">
        <table className="submission-table">
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Report Category</th>
              <th>Location</th>
              <th>Date Filed</th>
              <th>Operational Status</th>
              <th>Documentation</th>
            </tr>
          </thead>

          <tbody>
            {visibleSubmissions.length > 0 ? (
              visibleSubmissions.map((submission) => (
                <tr key={submission.caseId}>
                  <td className="case-cell">
                    {submission.caseId}
                  </td>

                  <td>
                    <span className="category-cell">
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        {getCategoryIcon(submission.category)}
                      </span>

                      {submission.category}
                    </span>
                  </td>

                  <td>{submission.location}</td>

                  <td>{submission.dateFiled}</td>

                  <td>
                    <span
                      className={getStatusClass(
                        submission.status,
                      )}
                    >
                      <span className="submission-status__dot" />

                      {submission.status}
                    </span>
                  </td>

                  <td className="documentation-cell">
                    <button
                      type="button"
                      className="receipt-button"
                      onClick={() =>
                        setMessage(
                          `Receipt for ${submission.caseId} will be available when document generation is connected.`,
                        )
                      }
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                      >
                        receipt_long
                      </span>

                      View Receipt
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="submission-table__empty"
                >
                  No active submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}