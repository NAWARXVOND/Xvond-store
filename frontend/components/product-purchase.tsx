"use client";

import { useMemo, useState } from "react";
import { formatPrice, productWithVariant } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { useCommerce } from "./commerce-provider";

export function ProductPurchase({ product, locale }: { product: Product; locale: Locale }) {
  const firstAvailable = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(product.variantId ?? firstAvailable?.id ?? "");
  const [added, setAdded] = useState(false);
  const { addToCart } = useCommerce();
  const ar = locale === "ar";
  const selected = useMemo(
    () => productWithVariant(product, variantId),
    [product, variantId],
  );
  const unavailable = !selected.variantId || selected.stock < 1;

  return (
    <div className="product-purchase">
      {product.variants.length > 1 && (
        <label className="variant-picker">
          <span>{ar ? "اختر الخيار" : "Choose option"}</span>
          <select
            value={variantId}
            onChange={(event) => {
              setVariantId(event.target.value);
              setAdded(false);
            }}
          >
            {product.variants.map((variant) => (
              <option key={variant.id} value={variant.id} disabled={variant.stock < 1}>
                {variant.title[locale]} · {formatPrice(variant.price, locale)}{variant.stock < 1 ? (ar ? " · غير متوفر" : " · Out of stock") : ""}
              </option>
            ))}
          </select>
        </label>
      )}
      {selected.variantTitle && product.variants.length > 1 && (
        <p className="variant-summary">
          <strong>{selected.variantTitle[locale]}</strong> · {formatPrice(selected.price, locale)} · {ar ? `${selected.stock} متوفر` : `${selected.stock} in stock`}
        </p>
      )}
      <button
        className="primary-button"
        type="button"
        disabled={unavailable}
        onClick={() => {
          addToCart(selected);
          setAdded(true);
        }}
      >
        {unavailable
          ? (ar ? "غير متوفر" : "Out of stock")
          : added
            ? (ar ? "تمت الإضافة ✓" : "Added ✓")
            : (ar ? "أضف إلى السلة" : "Add to cart")}
      </button>
    </div>
  );
}
