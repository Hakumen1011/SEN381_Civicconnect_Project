
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import AppRoutes from "./AppRoutes";

/**
 * Mock completed pages so that these tests focus
 * on route selection instead of page implementation.
 */
vi.mock("../features/staff/pages/StaffTriagePage", () => ({
  default: () => <h1>Staff Triage Test Page</h1>,
}));

vi.mock(
  "../features/request-management/pages/RequestManagementLifecyclePage",
  () => ({
    default: () => <h1>Request Management Test Page</h1>,
  }),
);

vi.mock(
  "../features/management/pages/ManagementPerformancePage",
  () => ({
    default: () => <h1>Management Analytics Test Page</h1>,
  }),
);

vi.mock("../features/requester/RequesterPortal", () => ({
  default: () => <h1>Requester Portal Test Page</h1>,
}));

/**
 * Displays the active path so redirect behaviour
 * can be verified independently of page content.
 */
function LocationProbe() {
  const location = useLocation();

  return (
    <output data-testid="current-route">
      {location.pathname}
    </output>
  );
}

function renderRoute(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe("CivicConnect application routing", () => {
  it("redirects the root URL to Request Management", () => {
    // TC-ROUTE-001
    renderRoute("/");

    expect(
      screen.getByTestId("current-route"),
    ).toHaveTextContent("/request-management");

    expect(
      screen.getByRole("heading", {
        name: "Request Management Test Page",
      }),
    ).toBeInTheDocument();
  });

  it("loads the Staff Triage route", () => {
    // TC-ROUTE-002
    renderRoute("/staff-triage");

    expect(
      screen.getByRole("heading", {
        name: "Staff Triage Test Page",
      }),
    ).toBeInTheDocument();
  });

  it("loads the Request Management route", () => {
    // TC-ROUTE-003
    renderRoute("/request-management");

    expect(
      screen.getByRole("heading", {
        name: "Request Management Test Page",
      }),
    ).toBeInTheDocument();
  });

  it("loads the Management Analytics route", () => {
    // TC-ROUTE-004
    renderRoute("/management");

    expect(
      screen.getByRole("heading", {
        name: "Management Analytics Test Page",
      }),
    ).toBeInTheDocument();
  });

    it("loads the actual Requester Self-Service route", () => {
    // TC-ROUTE-005
  // Verifies that the Requester route selects the portal
  // component instead of the temporary placeholder.

    renderRoute("/requester-self-service");

    expect(
        screen.getByRole("heading", {
        name: "Requester Portal Test Page",
        }),
    ).toBeInTheDocument();

    expect(
        screen.getByTestId("current-route"),
    ).toHaveTextContent("/requester-self-service");
    });

  it("displays a helpful fallback for unknown routes", () => {
    // TC-ROUTE-006 — negative route test
    renderRoute("/invalid-civicconnect-url");

    expect(
      screen.getByRole("heading", {
        name: "Page not found",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Return to Request Management",
      }),
    ).toHaveAttribute(
      "href",
      "/request-management",
    );
  });
});
