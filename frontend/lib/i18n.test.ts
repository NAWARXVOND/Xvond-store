import { describe, expect, it } from "vitest";
import { direction, isLocale } from "./i18n";

describe("locale helpers", () => {
  it("recognizes supported locales", () => { expect(isLocale("ar")).toBe(true); expect(isLocale("fr")).toBe(false); });
  it("maps writing direction", () => { expect(direction("ar")).toBe("rtl"); expect(direction("en")).toBe("ltr"); });
});

