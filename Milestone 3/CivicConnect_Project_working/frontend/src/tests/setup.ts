// Adds custom DOM assertions for Vitest.
// Examples: toBeInTheDocument(), toHaveClass(), toHaveAttribute().
import "@testing-library/jest-dom/vitest";

// Provides React component cleanup between automated tests.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Prevents components rendered during one test from
// remaining in the document during subsequent tests.
afterEach(() => {
  cleanup();
});