
/**
 * CivicConnect shared HTTP client.
 *
 * Uses the existing backend's /api routes.
 *
 * VITE_API_BASE_URL can specify the backend origin,
 * for example when Vite and Express run on
 * different development ports.
 *
 * Authentication tokens are supplied by the caller.
 * This client does not store tokens in localStorage.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(
    status: number,
    message: string,
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export interface ApiRequestOptions
  extends Omit<RequestInit, "body"> {
  token?: string;
  body?: unknown;
}

interface ErrorResponse {
  error?: {
    code?: string;
    message?: string;
  };
  message?: string;
}

function buildApiUrl(path: string): string {
  if (!path.startsWith("/") || path.startsWith("//")) {
    throw new Error(
      "API paths must be relative paths beginning with /.",
    );
  }

  const baseUrl = (
    import.meta.env.VITE_API_BASE_URL || ""
  ).trim().replace(/\/+$/, "");

  return `${baseUrl}${path}`;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { token, body, ...requestOptions } = options;

  const headers = new Headers(requestOptions.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(buildApiUrl(path), {
      ...requestOptions,
      headers,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  } catch (error) {
    // Preserve cancellation so callers can cancel
    // requests when React components unmount.
    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw error;
    }

    throw new ApiError(
      0,
      "Could not connect to the CivicConnect API.",
      "NETWORK_ERROR",
    );
  }

  let data: unknown = null;

  const responseText = await response.text();

  if (responseText.trim()) {
    try {
      data = JSON.parse(responseText);
    } catch {
      if (response.ok) {
        throw new ApiError(
          response.status,
          "The API returned an invalid JSON response.",
          "INVALID_RESPONSE",
        );
      }
    }
  }

  if (!response.ok) {
    const errorData = data as ErrorResponse | null;

    const message =
      errorData?.error?.message ||
      errorData?.message ||
      `API request failed with status ${response.status}.`;

    throw new ApiError(
      response.status,
      message,
      errorData?.error?.code,
    );
  }

  return data as T;
}
