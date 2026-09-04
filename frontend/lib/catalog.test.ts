import { describe, expect, it } from "vitest";

import { validPreviousPrice } from "./catalog";

describe("validPreviousPrice", () => {
  it("keeps a real higher previous price", () => {
    expect(validPreviousPrice(11.9, 15)).toBe(15);
  });

  it("hides an equal previous price", () => {
    expect(validPreviousPrice(15, 15)).toBeUndefined();
  });

  it("hides a lower previous price", () => {
    expect(validPreviousPrice(15, 12)).toBeUndefined();
  });

  it("hides missing or invalid previous prices", () => {
    expect(validPreviousPrice(15, null)).toBeUndefined();
    expect(validPreviousPrice(15, "not-a-price")).toBeUndefined();
  });
});
