import { describe, expect, it } from "vitest";

import { productWithVariant, validPreviousPrice } from "./catalog";
import type { Product } from "./catalog";

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

describe("productWithVariant", () => {
  const product: Product = {
    id: "product-1",
    slug: "phone-case",
    sku: "CASE-BLACK",
    category: "electronics",
    name: { ar: "غطاء هاتف", en: "Phone case" },
    description: {},
    price: 5,
    image: "/product-placeholder.svg",
    variantId: "black",
    variantTitle: { ar: "أسود", en: "Black" },
    stock: 10,
    variants: [
      { id: "black", sku: "CASE-BLACK", title: { ar: "أسود", en: "Black" }, price: 5, stock: 10 },
      { id: "blue", sku: "CASE-BLUE", title: { ar: "أزرق", en: "Blue" }, price: 6, stock: 2 },
    ],
  };

  it("maps price, sku and stock to the selected variant", () => {
    expect(productWithVariant(product, "blue")).toMatchObject({
      variantId: "blue",
      sku: "CASE-BLUE",
      price: 6,
      stock: 2,
      variantTitle: { ar: "أزرق", en: "Blue" },
    });
  });
});
