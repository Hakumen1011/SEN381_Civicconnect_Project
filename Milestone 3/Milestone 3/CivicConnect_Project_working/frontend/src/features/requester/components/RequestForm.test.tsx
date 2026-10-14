
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  vi,
} from "vitest";

import {
  fireEvent,
  render,
  screen,
} from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import RequestForm from "./RequestForm";

/**
 * SEN381 Milestone 3 — Request Form tests.
 *
 * Test techniques:
 * - Equivalence Partitioning
 * - Boundary Value Analysis
 * - Negative Testing
 *
 * The form currently creates demonstration requests.
 * It does not upload files to a real backend service.
 */

// JSDOM may not implement browser object-URL methods.
// Save and restore any existing implementations.
const originalCreateObjectURL = URL.createObjectURL;
const originalRevokeObjectURL = URL.revokeObjectURL;

beforeAll(() => {
  URL.createObjectURL = vi.fn(
    () => "blob:mock-request-image",
  );

  URL.revokeObjectURL = vi.fn();
});

afterAll(() => {
  if (originalCreateObjectURL) {
    URL.createObjectURL = originalCreateObjectURL;
  } else {
    delete (
      URL as unknown as Record<string, unknown>
    )["createObjectURL"];
  }

  if (originalRevokeObjectURL) {
    URL.revokeObjectURL = originalRevokeObjectURL;
  } else {
    delete (
      URL as unknown as Record<string, unknown>
    )["revokeObjectURL"];
  }
});

/**
 * Locate the existing hidden file input.
 *
 * It has no associated accessible label in the current
 * component, so this test selects it by input type.
 */
function getFileInput(
  container: HTMLElement,
): HTMLInputElement {
  const input =
    container.querySelector<HTMLInputElement>(
      'input[type="file"]',
    );

  if (!input) {
    throw new Error("Request attachment input not found.");
  }

  return input;
}

/**
 * Create a lightweight file with a controlled size.
 *
 * Avoid allocating a real 15 MB buffer in the test suite.
 */
function createSizedImage(
  name: string,
  size: number,
): File {
  const file = new File(["test image"], name, {
    type: "image/png",
  });

  Object.defineProperty(file, "size", {
    configurable: true,
    value: size,
  });

  return file;
}

describe("RequestForm validation and attachments", () => {
  it("rejects whitespace-only required fields", async () => {
    // TC-REQ-007
    // Equivalence partition: whitespace-only inputs
    // are invalid even though they contain characters.

    const user = userEvent.setup();
    const onSubmitted = vi.fn();

    render(
      <RequestForm onSubmitted={onSubmitted} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Clear",
      }),
    );

    await user.type(
      screen.getByRole("textbox", {
        name: /Request Title/i,
      }),
      "   ",
    );

    await user.type(
      screen.getByRole("textbox", {
        name: /Detailed Description/i,
      }),
      "   ",
    );

    await user.click(
      screen.getByRole("button", {
        name: /Submit Official Ticket/i,
      }),
    );

    const alert = screen.getByRole("alert");

    expect(alert).toHaveTextContent(
      "Request title is required.",
    );

    expect(alert).toHaveTextContent(
      "Request description is required.",
    );

    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it("rejects unsupported attachment types", () => {
    // TC-REQ-008
    // Equivalence partition: files outside the
    // approved PNG/JPEG/HEIC MIME-type set.

    const onSubmitted = vi.fn();

    const { container } = render(
      <RequestForm onSubmitted={onSubmitted} />,
    );

    const unsupportedFile = new File(
      ["example content"],
      "document.pdf",
      { type: "application/pdf" },
    );

    fireEvent.change(
      getFileInput(container),
      {
        target: {
          files: [unsupportedFile],
        },
      },
    );

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent(
      "Please select a PNG, JPG or HEIC image.",
    );

    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it("rejects images larger than 15 MB", () => {
    // TC-REQ-009
    // Boundary Value Analysis: 15 MB + 1 byte.

    const { container } = render(
      <RequestForm onSubmitted={vi.fn()} />,
    );

    const oversizedImage = createSizedImage(
      "oversized.png",
      15 * 1024 * 1024 + 1,
    );

    fireEvent.change(
      getFileInput(container),
      {
        target: {
          files: [oversizedImage],
        },
      },
    );

    expect(
      screen.getByRole("alert"),
    ).toHaveTextContent(
      "Images must be 15 MB or smaller.",
    );
  });

  it("accepts a PNG exactly at the 15 MB limit", async () => {
    // TC-REQ-010
    // Boundary Value Analysis: valid upper boundary.

    const user = userEvent.setup();
    const onSubmitted = vi.fn();

    const { container } = render(
      <RequestForm onSubmitted={onSubmitted} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Clear",
      }),
    );

    await user.type(
      screen.getByRole("textbox", {
        name: /Request Title/i,
      }),
      "Damaged street light",
    );

    await user.type(
      screen.getByRole("textbox", {
        name: /Detailed Description/i,
      }),
      "Street light is not functioning.",
    );

    const boundaryImage = createSizedImage(
      "boundary.png",
      15 * 1024 * 1024,
    );

    fireEvent.change(
      getFileInput(container),
      {
        target: {
          files: [boundaryImage],
        },
      },
    );

    expect(
      screen.queryByRole("alert"),
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: /Submit Official Ticket/i,
      }),
    );

    expect(onSubmitted).toHaveBeenCalledOnce();

    expect(onSubmitted).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Damaged street light",
        description:
          "Street light is not functioning.",
        fileName: "boundary.png",
      }),
    );
  });

  it("clears form fields and validation errors", async () => {
    // TC-REQ-011
    // Regression: form reset must remove invalid state.

    const user = userEvent.setup();
    const onSubmitted = vi.fn();

    render(
      <RequestForm onSubmitted={onSubmitted} />,
    );

    await user.click(
      screen.getByRole("button", {
        name: "Clear",
      }),
    );

    await user.click(
      screen.getByRole("button", {
        name: /Submit Official Ticket/i,
      }),
    );

    expect(
      screen.getByRole("alert"),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", {
        name: "Clear",
      }),
    );

    expect(
      screen.getByRole("textbox", {
        name: /Request Title/i,
      }),
    ).toHaveValue("");

    expect(
      screen.getByRole("textbox", {
        name: /Detailed Description/i,
      }),
    ).toHaveValue("");

    expect(
      screen.getByRole("textbox", {
        name: /Physical Location/i,
      }),
    ).toHaveValue("");

    expect(
      screen.queryByRole("alert"),
    ).not.toBeInTheDocument();

    expect(onSubmitted).not.toHaveBeenCalled();
  });
});
