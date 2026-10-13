
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ManagementPerformancePage from "./ManagementPerformancePage";

/**
 * Find a specific KPI card by its label and verify its value.
 *
 * This avoids matching similar numbers elsewhere on the page.
 */
function expectMetric(label: string, expectedValue: string) {
  // Locate the dedicated management statistics section.
  const statisticsSection = screen.getByRole("region", {
    name: "Management summary statistics",
  });

  // Search only within that section, not the entire page.
  const labelElement = within(statisticsSection).getByText(
    label,
    { exact: true },
  );

  // Each KPI is displayed inside an article element.
  const card = labelElement.closest("article");

  expect(card).not.toBeNull();

  // Verify the expected number belongs to the correct KPI.
  expect(
    within(card as HTMLElement).getByText(expectedValue, {
      exact: true,
    }),
  ).toBeInTheDocument();
}

/**
 * SEN381 M3 — Management dashboard functional tests.
 *
 * Test basis:
 * - Operational metric correctness
 * - Filtering consistency
 * - Empty-result handling
 * - Dashboard recovery after clearing filters
 *
 * All values are derived from the controlled demo dataset.
 */
describe("ManagementPerformancePage", () => {
  it("displays the expected management summary", () => {
    // TC-MGT-009: Initial dashboard presentation

    render(<ManagementPerformancePage />);

    expect(
      screen.getByRole("heading", {
        name: "Management & Analytics",
      }),
    ).toBeInTheDocument();

    expectMetric("Total Requests", "8");
    expectMetric("Open Requests", "5");
    expectMetric("Completed Requests", "3");
    expectMetric("Overdue Requests", "3");
    expectMetric("SLA Compliance", "63%");
  });

  it("updates KPIs and records when filtering by department", async () => {
    // TC-MGT-010: Department filter consistency

    const user = userEvent.setup();

    render(<ManagementPerformancePage />);

    await user.selectOptions(
      screen.getByLabelText("Department"),
      "Water Services",
    );

    expectMetric("Total Requests", "2");
    expectMetric("Open Requests", "2");
    expectMetric("Completed Requests", "0");
    expectMetric("Overdue Requests", "1");

    const table = screen.getByRole("table");

    expect(
      within(table).getByText("CC-2026-1001"),
    ).toBeInTheDocument();

    expect(
      within(table).getByText("CC-2026-1004"),
    ).toBeInTheDocument();

    expect(
      within(table).queryByText("CC-2026-1002"),
    ).not.toBeInTheDocument();
  });

  it("filters requests by lifecycle status", async () => {
    // TC-MGT-011: Status filter consistency

    const user = userEvent.setup();

    render(<ManagementPerformancePage />);

    await user.selectOptions(
      screen.getByLabelText("Request status"),
      "Resolved",
    );

    expectMetric("Total Requests", "2");
    expectMetric("Open Requests", "0");
    expectMetric("Completed Requests", "2");

    const table = screen.getByRole("table");

    expect(
      within(table).getByText("CC-2026-1003"),
    ).toBeInTheDocument();

    expect(
      within(table).getByText("CC-2026-1008"),
    ).toBeInTheDocument();

    expect(
      within(table).queryByText("CC-2026-1001"),
    ).not.toBeInTheDocument();
  });

  it("handles a filter combination with no matching requests", async () => {
    // TC-MGT-012: Negative / empty-data scenario

    const user = userEvent.setup();

    render(<ManagementPerformancePage />);

    await user.selectOptions(
      screen.getByLabelText("Department"),
      "Water Services",
    );

    await user.selectOptions(
      screen.getByLabelText("Request status"),
      "Closed",
    );

    expectMetric("Total Requests", "0");
    expectMetric("SLA Compliance", "N/A");

    expect(
      screen.getByText(
        "No requests match the current filters.",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByText("No matching requests."),
    ).toBeInTheDocument();
  });

  it("restores all records when filters are cleared", async () => {
    // TC-MGT-013: Filter reset / regression scenario

    const user = userEvent.setup();

    render(<ManagementPerformancePage />);

    const departmentFilter =
      screen.getByLabelText("Department");

    const statusFilter =
      screen.getByLabelText("Request status");

    await user.selectOptions(
      departmentFilter,
      "Water Services",
    );

    await user.selectOptions(
      statusFilter,
      "Closed",
    );

    expectMetric("Total Requests", "0");

    await user.click(
      screen.getByRole("button", {
        name: "Clear filters",
      }),
    );

    expect(departmentFilter).toHaveValue("all");
    expect(statusFilter).toHaveValue("all");

    expectMetric("Total Requests", "8");
    expectMetric("Open Requests", "5");
    expectMetric("Completed Requests", "3");
  });
});
