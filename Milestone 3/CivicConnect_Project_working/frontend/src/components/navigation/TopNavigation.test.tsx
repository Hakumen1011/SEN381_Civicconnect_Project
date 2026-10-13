import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import TopNavigation from "./TopNavigation";

// These tests verify visible behaviour rather than internal implementation.
describe("TopNavigation", () => {
  it("renders the CivicConnect brand and navigation links", () => {
    render(
      <TopNavigation activeNavigation="staff-triage" />,
    );

    // Confirm the local brand asset and accessible navigation exist.
    expect(
      screen.getByRole("img", { name: "CivicConnect Logo" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Staff Triage Queue" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Management & Analytics" }),
    ).toBeInTheDocument();
  });

  it("marks the selected navigation link as the current page", () => {
    render(
      <TopNavigation activeNavigation="staff-triage" />,
    );

    const staffLink = screen.getByRole("link", {
      name: "Staff Triage Queue",
    });

    // This checks the accessible state, not just the link's colour.
    expect(staffLink).toHaveAttribute("aria-current", "page");
  });

  it("opens and closes the mobile navigation menu", async () => {
    const user = userEvent.setup();

    render(<TopNavigation />);

    const menuButton = screen.getByRole("button", {
      name: "Open navigation",
    });

    const navigation = document.getElementById(
      "civicconnect-primary-navigation",
    );

    expect(navigation).not.toBeNull();
    expect(menuButton).toHaveAttribute("aria-expanded", "false");

    // Open the responsive menu.
    await user.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "true");
    expect(navigation).toHaveClass(
      "top-navigation__links--open",
    );

    // Clicking again should close it.
    await user.click(menuButton);

    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(navigation).not.toHaveClass(
      "top-navigation__links--open",
    );
  });
});