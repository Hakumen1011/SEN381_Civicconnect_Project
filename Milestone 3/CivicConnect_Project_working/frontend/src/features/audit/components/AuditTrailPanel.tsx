import { useMemo, useState } from "react";

import type { CaseAuditEvent } from
  "../../request-management/components/requestManagementTypes";

import {
  filterAuditEvents,
  type AuditSortOrder,
} from "../audit";

import "./AuditTrailPanel.css";

interface AuditTrailPanelProps {
  events: CaseAuditEvent[];
  caseReference: string;
}

/**
 * Format a timestamp in South African local time.
 * Stored timestamps are not changed.
 */
function formatAuditTime(timestamp: string): string {
  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
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
 * Displays supplied audit events.
 *
 * Requirement area: audit visibility and traceability.
 *
 * This is currently a frontend demonstration.
 * Recording and securing audit events requires the backend.
 */
export default function AuditTrailPanel({
  events,
  caseReference,
}: AuditTrailPanelProps) {
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] =
    useState<AuditSortOrder>("newest");

  const filteredEvents = useMemo(
    () =>
      filterAuditEvents(events, {
        searchText,
        sortOrder,
      }),
    [events, searchText, sortOrder],
  );

  return (
    <section
      className="audit-trail"
      aria-label={`Audit history for ${caseReference}`}
    >
      <div className="audit-trail__intro">
        <div>
          <h3>Recorded Case Activity</h3>
          <p>
            Review recorded actions and the staff or system
            actor associated with each event.
          </p>
        </div>

        <span className="audit-trail__count">
          {filteredEvents.length} of {events.length} events
        </span>
      </div>

      <div className="audit-trail__controls">
        <div className="audit-trail__search">
          <label htmlFor="audit-event-search">
            Search audit history
          </label>

          <input
            id="audit-event-search"
            type="search"
            value={searchText}
            onChange={(event) =>
              setSearchText(event.target.value)
            }
            placeholder="Search actor, action or details..."
          />
        </div>

        <div className="audit-trail__sort">
          <label htmlFor="audit-event-sort">
            Sort events
          </label>

          <select
            id="audit-event-sort"
            value={sortOrder}
            onChange={(event) =>
              setSortOrder(event.target.value as AuditSortOrder)
            }
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="audit-trail__empty" role="status">
          <span
            className="material-symbols-outlined"
            aria-hidden="true"
          >
            search_off
          </span>

          <strong>No matching audit events</strong>

          <p>
            {events.length === 0
              ? "No audit events have been provided for this case."
              : "Try another search term to find a recorded action."}
          </p>
        </div>
      ) : (
        <ol className="audit-trail__events">
          {filteredEvents.map((event) => (
            <li key={event.id} className="audit-trail__event">
              <span
                className="audit-trail__event-icon material-symbols-outlined"
                aria-hidden="true"
              >
                history
              </span>

              <div className="audit-trail__event-content">
                <div className="audit-trail__event-heading">
                  <strong>{event.action}</strong>

                  <time dateTime={event.timestamp}>
                    {formatAuditTime(event.timestamp)}
                  </time>
                </div>

                <span className="audit-trail__actor">
                  Actor: {event.actor}
                </span>

                <p>{event.details}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      <p className="audit-trail__disclaimer">
        This panel displays supplied demonstration records.
        Search and sorting do not modify audit history.
        Server-side recording and integrity verification
        are not yet implemented.
      </p>
    </section>
  );
}