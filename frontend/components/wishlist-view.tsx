"use client";

import Link from "next/link";
import type { Product } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { useCommerce } from "./commerce-provider";
import { ProductCard } from "./product-card";

export function WishlistView({ locale, products }: { locale: Locale; products: Product[] }) {
  const { wishlist } = useCommerce();
  const selected = products.filter((product) => wishlist.includes(product.slug));
  const ar = locale === "ar";
  return <main className="content-page shell"><p className="eyebrow">XVOND SAVED</p><h1>{ar ? "المفضلة" : "Wishlist"}</h1>{selected.length ? <div className="product-grid">{selected.map((product) => <ProductCard product={product} locale={locale} key={product.slug} />)}</div> : <div className="empty-card"><p>{ar ? "لم تحفظ أي منتج بعد." : "You have not saved any products yet."}</p><Link className="primary-button" href={`/${locale}`}>{ar ? "اكتشف المنتجات" : "Discover products"}</Link></div>}</main>;
}
