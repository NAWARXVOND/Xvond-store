"use client";

import { useState } from "react";
import type { Product } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { useCommerce } from "./commerce-provider";

export function ProductPurchase({ product, locale }: { product: Product; locale: Locale }) {
  const [added, setAdded] = useState(false);
  const { addToCart } = useCommerce();
  const ar = locale === "ar";
  return <button className="primary-button" type="button" disabled={product.stock < 1} onClick={() => { addToCart(product); setAdded(true); }}>{product.stock < 1 ? (ar ? "غير متوفر" : "Out of stock") : added ? (ar ? "تمت الإضافة ✓" : "Added ✓") : (ar ? "أضف إلى السلة" : "Add to cart")}</button>;
}
