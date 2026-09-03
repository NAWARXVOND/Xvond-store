import { describe, expect, it } from "vitest";
import {
  appendStoreContext,
  categorySlugsForStore,
  storeForCategorySlug,
  storeForPath,
  storeHomePath,
  storeNewArrivalsPath,
} from "./store-context";

describe("store routing helpers", () => {
  it("maps real categories to their owning store", () => {
    expect(storeForCategorySlug("women")).toBe("lifestyle");
    expect(storeForCategorySlug("automotive")).toBe("lifestyle");
    expect(storeForCategorySlug("electronics")).toBe("smart");
    expect(storeForCategorySlug("xvond-box")).toBe("smart");
    expect(storeForCategorySlug("unknown")).toBeNull();
  });

  it("detects store context from store and category routes", () => {
    expect(storeForPath("/ar/lifestyle", "ar")).toBe("lifestyle");
    expect(storeForPath("/en/smart/new-arrivals", "en")).toBe("smart");
    expect(storeForPath("/ar/category/kids", "ar")).toBe("lifestyle");
    expect(storeForPath("/ar/category/electronics", "ar")).toBe("smart");
  });

  it("keeps explicit store context on shared routes", () => {
    expect(storeForPath("/ar/cart", "ar", "smart")).toBe("smart");
    expect(appendStoreContext("/ar/cart", "smart")).toBe("/ar/cart?store=smart");
    expect(appendStoreContext("/ar/search?q=test", "lifestyle")).toBe("/ar/search?q=test&store=lifestyle");
  });

  it("builds canonical store paths", () => {
    expect(storeHomePath("ar", "lifestyle")).toBe("/ar/lifestyle");
    expect(storeNewArrivalsPath("en", "smart")).toBe("/en/smart/new-arrivals");
    expect(categorySlugsForStore("smart")).toEqual(["electronics", "xvond-box"]);
  });
});
