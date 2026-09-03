"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Product } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { useCommerce } from "./commerce-provider";
import { ProductCard } from "./product-card";

export function WishlistView({ locale, products }: { locale: Locale; products: Product[] }) {
  const { wishlist } = useCommerce();
  const searchParams = useSearchParams();
  const hintedStore = searchParams.get("store");
  const store = hintedStore === "lifestyle" || hintedStore === "smart" ? hintedStore : null;
  const selected = products.filter((product) => wishlist.includes(product.slug));
  const ar = locale === "ar";
  const discoverHref = store ? `/${locale}/${store}` : `/${locale}`;
  const eyebrow = store === "lifestyle" ? "XVOND LIFESTYLE STORE" : store === "smart" ? "XVOND SMART STORE" : "XVOND SAVED";

  return <main className="content-page shell"><p className="eyebrow">{eyebrow}</p><h1>{ar ? "المفضلة" : "Wishlist"}</h1>{selected.length ? <div className="product-grid">{selected.map((product) => <ProductCard product={product} locale={locale} key={product.slug} />)}</div> : <div className="empty-card"><p>{ar ? "لم تحفظ أي منتج بعد." : "You have not saved any products yet."}</p><Link className="primary-button" href={discoverHref}>{ar ? "اكتشف المنتجات" : "Discover products"}</Link></div>}</main>;
}
