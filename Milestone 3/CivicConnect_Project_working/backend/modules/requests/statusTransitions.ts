import type { RequestStatus } from './request.types.js';

/**
 * FR-STF-007: the request workflow. Only these status changes are allowed.
 *
 *   SUBMITTED -> ASSIGNED -> IN_PROGRESS <-> ON_HOLD
 *                               |
 *                               v
 *                            RESOLVED -> CLOSED
 *                               |
 *                               +-> IN_PROGRESS (re-opened)
 *   SUBMITTED / ASSIGNED -> REJECTED
 */
export const ALLOWED_TRANSITIONS: Readonly<Record<RequestStatus, readonly RequestStatus[]>> = {
  SUBMITTED: ['ASSIGNED', 'REJECTED'],
  ASSIGNED: ['IN_PROGRESS', 'REJECTED'],
  IN_PROGRESS: ['ON_HOLD', 'RESOLVED'],
  ON_HOLD: ['IN_PROGRESS'],
  RESOLVED: ['CLOSED', 'IN_PROGRESS'],
  CLOSED: [],
  REJECTED: [],
};

export function canTransition(from: RequestStatus, to: RequestStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Statuses that need an explanation from staff when they are set. */
export const NOTE_REQUIRED: readonly RequestStatus[] = ['RESOLVED', 'REJECTED', 'ON_HOLD'];

/** Final statuses: the request can no longer change. */
export const isFinal = (status: RequestStatus) => ALLOWED_TRANSITIONS[status].length === 0;
