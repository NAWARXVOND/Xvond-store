"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog";
import { useCommerce } from "./commerce-provider";

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  const { addToCart, toggleWishlist, wishlist } = useCommerce();
  const wished = wishlist.includes(product.slug);
  return (
    <article className="product-card">
      <Link href={`/${locale}/product/${product.slug}`} className="product-image-wrap">
        <Image src={product.image} alt={product.name[locale]} fill sizes="(max-width: 640px) 70vw, 24vw" className="product-image" />
      </Link>
      <div className="product-copy">
        <div>
          <p>{product.name[locale]}</p>
          <div className="price-line">
            <strong>{formatPrice(product.price, locale)}</strong>
            {product.previousPrice && <del>{formatPrice(product.previousPrice, locale)}</del>}
          </div>
        </div>
        <div className="card-actions">
          <button type="button" className="heart-button" disabled={product.stock < 1} onClick={() => addToCart(product)} aria-label={locale === "ar" ? "أضف إلى السلة" : "Add to cart"}><ShoppingBagIcon /></button>
          <button type="button" className={`heart-button ${wished ? "is-wished" : ""}`} onClick={() => toggleWishlist(product.slug)} aria-pressed={wished} aria-label={locale === "ar" ? "أضف إلى المفضلة" : "Add to wishlist"}>
            {wished ? <HeartSolidIcon /> : <HeartIcon />}
          </button>
        </div>
      </div>
    </article>
  );
}
