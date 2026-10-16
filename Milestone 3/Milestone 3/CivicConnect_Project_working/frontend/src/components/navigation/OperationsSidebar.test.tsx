
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import OperationsSidebar from "./OperationsSidebar";

/**
 * SEN381 M3 — Sidebar navigation regression tests.
 *
 * Test basis:
 * - Navigation must reach existing application routes.
 * - Custom navigation callbacks must remain supported.
 * - The currently selected section must be identifiable.
 */
describe("OperationsSidebar", () => {
  it("provides correct destinations for operational links", () => {
    // TC-NAV-004
    // Regression: sidebar links previously used href="#".

    render(<OperationsSidebar />);

    expect(
      screen.getByRole("link", {
        name: /^Triage Inbox/,
    }),
    ).toHaveAttribute("href", "/staff-triage");

    expect(
      screen.getByRole("link", {
        name: "All Work Orders",
      }),
    ).toHaveAttribute("href", "/request-management");

    expect(
      screen.getByRole("link", {
        name: "SLA Compliance",
      }),
    ).toHaveAttribute("href", "/management");

    expect(
      screen.getByRole("link", {
        name: "Citizen Portal Feed",
      }),
    ).toHaveAttribute(
      "href",
      "/requester-self-service",
    );
  });

  it("preserves custom navigation callback behaviour", () => {
    // TC-NAV-005
    // When a callback exists, the parent can handle
    // navigation without triggering the default link.

    const onNavigate = vi.fn();

    render(
      <OperationsSidebar
        activeNavigation="request-management"
        onNavigate={onNavigate}
      />,
    );

    fireEvent.click(
      screen.getByRole("link", {
        name: "SLA Compliance",
      }),
    );

    expect(onNavigate).toHaveBeenCalledExactlyOnceWith(
      "management-analytics",
    );
  });

  it("identifies the active Management section", () => {
    // TC-NAV-006
    // Accessibility and navigation feedback.

    render(
      <OperationsSidebar
        activeNavigation="management-analytics"
      />,
    );

    expect(
      screen.getByRole("link", {
        name: "SLA Compliance",
      }),
    ).toHaveAttribute("aria-current", "page");

    expect(
    screen.getByRole("link", {
    name: /^Triage Inbox/,
    }),
    ).not.toHaveAttribute("aria-current");
  });
});
