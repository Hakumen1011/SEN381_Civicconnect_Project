import type { RequestStatus } from '../requests/request.types.js';


const STATUS_LABELS: Record<RequestStatus, string> = {
  SUBMITTED: 'received',
  ASSIGNED: 'assigned to a staff member',
  IN_PROGRESS: 'in progress',
  ON_HOLD: 'on hold',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
  REJECTED: 'rejected',
};

export function requestReceived(reference: string) {
  return {
    template: 'request_received',
    message: `CivicConnect: Your request ${reference} has been received. Log in to track its progress.`,
  };
}

export function statusChanged(reference: string, status: RequestStatus) {
  return {
    template: 'request_status_update',
    message: `CivicConnect: Request ${reference} is now ${STATUS_LABELS[status]}. Log in to view the details.`,
  };
}

export function assignedToYou(reference: string) {
  return {
    template: 'request_assigned_to_you',
    message: `CivicConnect: Request ${reference} has been assigned to you.`,
  };
}
