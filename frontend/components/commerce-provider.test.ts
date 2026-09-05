import { describe, expect, it } from "vitest";

import { cartLineKey } from "./commerce-provider";
import type { Product } from "@/lib/catalog";

const baseProduct: Product = {
  id: "p1",
  slug: "shirt",
  sku: "SHIRT",
  category: "women",
  name: { ar: "قميص", en: "Shirt" },
  description: {},
  price: 10,
  image: "/product-placeholder.svg",
  stock: 10,
  variants: [],
};

describe("cartLineKey", () => {
  it("keeps two variants of one product as separate cart lines", () => {
    expect(cartLineKey({ ...baseProduct, variantId: "small" }))
      .not.toBe(cartLineKey({ ...baseProduct, variantId: "large" }));
  });
});
