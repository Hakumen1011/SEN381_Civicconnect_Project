
import { describe, expect, it } from "vitest";

import {
  getMunicipalCategoryCode,
  MUNICIPAL_CATEGORY_CODES,
} from "./requesterApi";

describe("Municipal request API category mapping", () => {
  it("maps Street Lighting to the backend code", () => {
    expect(
      getMunicipalCategoryCode("Street Lighting"),
    ).toBe("STREET_LIGHTING");
  });

  it("maps all six municipal categories", () => {
    expect(
      Object.values(MUNICIPAL_CATEGORY_CODES),
    ).toEqual([
      "ROAD_PAVEMENT",
      "STREET_LIGHTING",
      "STORMWATER_DRAIN",
      "SOLID_WASTE",
      "PARKS_GREENERY",
      "CODE_COMPLIANCE",
    ]);
  });

  it("rejects unsupported categories", () => {
    expect(() =>
      getMunicipalCategoryCode("Unknown Category"),
    ).toThrow(
      "Unsupported municipal request category",
    );
  });
});
