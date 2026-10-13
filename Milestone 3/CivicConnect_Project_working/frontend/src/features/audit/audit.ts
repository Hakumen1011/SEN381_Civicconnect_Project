import type { CaseAuditEvent } from
  "../request-management/components/requestManagementTypes";

export type AuditSortOrder = "newest" | "oldest";

export interface AuditFilterOptions {
  searchText: string;
  sortOrder: AuditSortOrder;
}

/**
 * Search and order audit events for display.
 *
 * This function is read-only:
 * it never modifies the original event array.
 */
export function filterAuditEvents(
  events: CaseAuditEvent[],
  options: AuditFilterOptions,
): CaseAuditEvent[] {
  const search = options.searchText.trim().toLowerCase();

  const filteredEvents = events.filter((event) => {
    if (search === "") {
      return true;
    }

    // Allow searching by actor, action, or event details.
    const searchableText = [
      event.actor,
      event.action,
      event.details,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(search);
  });

  // Copy before sorting to preserve the source collection.
  return [...filteredEvents].sort((first, second) => {
    const firstTime = Date.parse(first.timestamp);
    const secondTime = Date.parse(second.timestamp);

    const firstValid = Number.isFinite(firstTime);
    const secondValid = Number.isFinite(secondTime);

    // Records with invalid timestamps appear after valid ones.
    if (!firstValid && !secondValid) return 0;
    if (!firstValid) return 1;
    if (!secondValid) return -1;

    return options.sortOrder === "newest"
      ? secondTime - firstTime
      : firstTime - secondTime;
  });
}