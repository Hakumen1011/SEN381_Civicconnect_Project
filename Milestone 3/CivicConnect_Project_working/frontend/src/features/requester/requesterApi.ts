
import { apiRequest } from "../../services/apiClient";
import type { RequestDraft } from "./requesterData";

/**
 * CivicConnect M3 — Requester API integration.
 *
 * Uses the existing Express backend endpoints.
 * Tokens are provided explicitly by the calling component.
 */

export const MUNICIPAL_CATEGORY_CODES = {
  "Road & Pavement": "ROAD_PAVEMENT",
  "Street Lighting": "STREET_LIGHTING",
  "Stormwater & Drain": "STORMWATER_DRAIN",
  "Solid Waste": "SOLID_WASTE",
  "Parks & Greenery": "PARKS_GREENERY",
  "Code Compliance": "CODE_COMPLIANCE",
} as const;

export type MunicipalCategoryCode =
  (typeof MUNICIPAL_CATEGORY_CODES)[keyof typeof MUNICIPAL_CATEGORY_CODES];

export interface RequesterUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthSession {
  token: string;
  user: RequesterUser;
}

export interface BackendServiceRequest {
  id: string;
  reference: string;
  requesterId: string;
  category: string;
  title: string;
  description: string;
  location: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status:
    | "SUBMITTED"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "ON_HOLD"
    | "RESOLVED"
    | "CLOSED"
    | "REJECTED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateRequestResponse {
  message: string;
  request: BackendServiceRequest;
}

export interface RequestListResponse {
  items: BackendServiceRequest[];
  total: number;
}

export function getMunicipalCategoryCode(
  label: string,
): MunicipalCategoryCode {
  const code =
    MUNICIPAL_CATEGORY_CODES[
      label as keyof typeof MUNICIPAL_CATEGORY_CODES
    ];

  if (!code) {
    throw new Error(
      `Unsupported municipal request category: ${label}`,
    );
  }

  return code;
}

export function registerRequester(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthSession> {
  return apiRequest<AuthSession>("/api/auth/register", {
    method: "POST",
    body: input,
  });
}

export function loginRequester(input: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  return apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body: input,
  });
}

export function submitMunicipalRequest(
  draft: RequestDraft,
  token: string,
): Promise<CreateRequestResponse> {
  if (draft.fileName) {
    throw new Error(
      "Photo upload is not yet supported by the backend. " +
        "Remove the attachment before submitting.",
    );
  }

  return apiRequest<CreateRequestResponse>(
    "/api/requests",
    {
      method: "POST",
      token,
      body: {
        title: draft.title.trim(),
        description: draft.description.trim(),
        category: getMunicipalCategoryCode(
          draft.category,
        ),
        location: draft.location.trim(),
      },
    },
  );
}

export function listMyRequests(
  token: string,
): Promise<RequestListResponse> {
  return apiRequest<RequestListResponse>(
    "/api/requests",
    {
      method: "GET",
      token,
    },
  );
}

export function getMyRequest(
  requestId: string,
  token: string,
): Promise<{
  request: BackendServiceRequest;
}> {
  return apiRequest<{
    request: BackendServiceRequest;
  }>(
    `/api/requests/${encodeURIComponent(requestId)}`,
    {
      method: "GET",
      token,
    },
  );
}
