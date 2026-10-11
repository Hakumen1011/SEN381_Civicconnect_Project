import type { Priority, RequestStatus, ServiceRequest } from './request.types.js';

/**
 * Service-level targets used to decide when a request is overdue (FR-MGT-002).
 * ASSUMPTION: these hours are a starting point agreed for the prototype; the real
 * municipal service criteria still need to be confirmed with stakeholders.
 */
export const TARGET_HOURS: Readonly<Record<Priority, number>> = {
  HIGH: 24,
  MEDIUM: 72,
  LOW: 120,
};

/** Statuses where the work is finished, so the request can no longer be overdue. */
export const DONE_STATUSES: readonly RequestStatus[] = ['RESOLVED', 'CLOSED', 'REJECTED'];
export const OPEN_STATUSES: readonly RequestStatus[] = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'];

export function dueDateFor(priority: Priority, createdAt: Date): string {
  return new Date(createdAt.getTime() + TARGET_HOURS[priority] * 60 * 60 * 1000).toISOString();
}

export function isOverdue(request: Pick<ServiceRequest, 'status' | 'dueAt'>, now: Date = new Date()): boolean {
  return !DONE_STATUSES.includes(request.status) && now.getTime() > Date.parse(request.dueAt);
}
