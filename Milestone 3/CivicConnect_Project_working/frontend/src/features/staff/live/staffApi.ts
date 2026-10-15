import { apiRequest } from "../../../services/apiClient";

/** The documented Express request lifecycle. These are not frontend-only statuses. */
export const REQUEST_TRANSITIONS = {
  SUBMITTED: ["ASSIGNED", "REJECTED"],
  ASSIGNED: ["IN_PROGRESS", "REJECTED"],
  IN_PROGRESS: ["ON_HOLD", "RESOLVED"],
  ON_HOLD: ["IN_PROGRESS"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: [],
  REJECTED: [],
} as const;

export type BackendStatus = keyof typeof REQUEST_TRANSITIONS;
export type StaffRole = "REQUESTER" | "STAFF" | "MANAGER" | "ADMIN";

export interface StaffSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: StaffRole;
  };
}

export interface LiveRequest {
  id: string;
  reference: string;
  requesterId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: BackendStatus;
  assigneeId: string | null;
  resolution: string | null;
  dueAt: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  overdue: boolean;
}

export interface RequestPage {
  items: LiveRequest[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StaffAuditTrail {
  request: LiveRequest;
  history: Array<{
    id: string;
    fromStatus: BackendStatus | null;
    toStatus: BackendStatus;
    changedByName: string;
    note: string | null;
    changedAt: string;
  }>;
  actions: Array<{
    id: string;
    body: string;
    authorName: string;
    createdAt: string;
  }>;
}

const staffRoles: readonly StaffRole[] = ["STAFF", "MANAGER", "ADMIN"];

export async function loginStaff(email: string, password: string): Promise<StaffSession> {
  const session = await apiRequest<StaffSession>("/api/auth/login", {
    method: "POST",
    body: { email: email.trim(), password },
  });

  if (!session.user || !staffRoles.includes(session.user.role)) {
    throw new Error("This account is not authorised for staff operations.");
  }
  return session;
}

export function listStaffRequests(token: string): Promise<RequestPage> {
  // Intentionally only the first 100; do not claim all records are shown.
  return apiRequest<RequestPage>("/api/requests?page=1&pageSize=100", { token });
}

export function assignToMe(requestId: string, token: string): Promise<{ request: LiveRequest }> {
  // Backend will infer the authenticated staff user's ID and enforce ownership.
  return apiRequest<{ request: LiveRequest }>(
    `/api/requests/${encodeURIComponent(requestId)}/assignment`,
    { method: "PUT", token, body: {} },
  );
}

export async function changeRequestStatus(
  request: LiveRequest,
  status: BackendStatus,
  note: string,
  token: string,
): Promise<{ request: LiveRequest }> {
  if (!(REQUEST_TRANSITIONS[request.status] as readonly BackendStatus[]).includes(status)) {
    throw new Error(`Invalid transition: ${request.status} to ${status}.`);
  }
  if (["RESOLVED", "REJECTED", "ON_HOLD"].includes(status) && !note.trim()) {
    throw new Error(`A note is required when changing status to ${status}.`);
  }
  return apiRequest<{ request: LiveRequest }>(
    `/api/requests/${encodeURIComponent(request.id)}/status`,
    {
      method: "PUT",
      token,
      body: { status, note: note.trim(), expectedVersion: request.version },
    },
  );
}

export function getStaffAuditTrail(requestId: string, token: string): Promise<StaffAuditTrail> {
  return apiRequest<StaffAuditTrail>(
    `/api/requests/${encodeURIComponent(requestId)}/history`,
    { token },
  );
}

export function statusesStaffMaySet(request: LiveRequest, session: StaffSession): BackendStatus[] {
  // Staff must own the request; managers can change any visible request.
  const isManager = session.user.role === "MANAGER" || session.user.role === "ADMIN";
  if (!isManager && request.assigneeId !== session.user.id) return [];
  return (REQUEST_TRANSITIONS[request.status] as readonly BackendStatus[]).filter(
    (status) => status !== "ASSIGNED" && (isManager || !["CLOSED", "REJECTED"].includes(status)),
  );
}
