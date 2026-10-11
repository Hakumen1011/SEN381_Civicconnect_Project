import type { Priority, RequestStatus, ServiceRequest } from './request.types.js';


export const TARGET_HOURS: Readonly<Record<Priority, number>> = {
  HIGH: 24,
  MEDIUM: 72,
  LOW: 120,
};


export const DONE_STATUSES: readonly RequestStatus[] = ['RESOLVED', 'CLOSED', 'REJECTED'];
export const OPEN_STATUSES: readonly RequestStatus[] = ['SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD'];

export function dueDateFor(priority: Priority, createdAt: Date): string {
  return new Date(createdAt.getTime() + TARGET_HOURS[priority] * 60 * 60 * 1000).toISOString();
}

export function isOverdue(request: Pick<ServiceRequest, 'status' | 'dueAt'>, now: Date = new Date()): boolean {
  return !DONE_STATUSES.includes(request.status) && now.getTime() > Date.parse(request.dueAt);
}
