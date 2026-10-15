
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import { ApiError, apiRequest } from "./apiClient";

const fetchMock = vi.fn();

function mockResponse(
  status: number,
  body: unknown,
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () =>
      body === null ? "" : JSON.stringify(body),
  } as Response;
}

describe("CivicConnect API client", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parses a successful health response", async () => {
    // TC-API-CLIENT-001

    fetchMock.mockResolvedValue(
      mockResponse(200, {
        status: "ok",
        time: "2026-10-14T10:00:00.000Z",
      }),
    );

    const result = await apiRequest<{
      status: string;
      time: string;
    }>("/api/health");

    expect(result.status).toBe("ok");

    expect(fetchMock).toHaveBeenCalledOnce();

    const [url] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    expect(url.endsWith("/api/health")).toBe(true);
  });

  it("sends JSON and a bearer token", async () => {
    // TC-API-CLIENT-002

    fetchMock.mockResolvedValue(
      mockResponse(201, {
        message: "Request created",
        request: {
          id: "example-id",
        },
      }),
    );

    await apiRequest("/api/requests", {
      method: "POST",
      token: "test-token",
      body: {
        title: "Broken light",
      },
    });

    const [, options] = fetchMock.mock.calls[0] as [
      string,
      RequestInit,
    ];

    const headers = new Headers(options.headers);

    expect(headers.get("Authorization")).toBe(
      "Bearer test-token",
    );

    expect(headers.get("Content-Type")).toBe(
      "application/json",
    );

    expect(JSON.parse(options.body as string)).toEqual({
      title: "Broken light",
    });
  });

  it("handles an unauthorised API response", async () => {
    // TC-API-CLIENT-003

    fetchMock.mockResolvedValue(
      mockResponse(401, {
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication is required.",
        },
      }),
    );

    await expect(
      apiRequest("/api/requests"),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      code: "UNAUTHORIZED",
      message: "Authentication is required.",
    });
  });

  it("handles a network connection failure", async () => {
    // TC-API-CLIENT-004

    fetchMock.mockRejectedValue(
      new TypeError("Failed to fetch"),
    );

    await expect(
      apiRequest("/api/health"),
    ).rejects.toMatchObject({
      name: "ApiError",
      status: 0,
      code: "NETWORK_ERROR",
    });
  });

  it("handles an empty successful response", async () => {
    // TC-API-CLIENT-005

    fetchMock.mockResolvedValue(
      mockResponse(204, null),
    );

    const result = await apiRequest<void>(
      "/api/example",
      {
        method: "DELETE",
      },
    );

    expect(result).toBeNull();
  });
});
