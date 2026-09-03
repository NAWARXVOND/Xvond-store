import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import type { StoreContext } from "@/lib/store-context";
import { categorySlugsForStore, storeHomePath } from "@/lib/store-context";

type SearchQuery = { q?: string; store?: string };

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SearchQuery> }) {
  const [{ locale }, { q = "", store: rawStore }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const store: StoreContext | null = rawStore === "lifestyle" || rawStore === "smart" ? rawStore : null;
  const query = q.trim();
  const allResults = query ? await getProducts({ query, limit: 60 }) : [];
  const allowed = store ? new Set(categorySlugsForStore(store)) : null;
  const results = allowed ? allResults.filter((product) => allowed.has(product.category)) : allResults;
  const ar = locale === "ar";
  const storeName = store === "lifestyle" ? "Xvond Lifestyle Store" : store === "smart" ? "Xvond Smart Store" : "Xvond Store";

  return (
    <main className="content-page shell">
      {store && <Link href={storeHomePath(locale, store)} className="secondary-button">← {storeName}</Link>}
      <p className="eyebrow" style={{ marginTop: store ? "2rem" : undefined }}>{storeName.toUpperCase()}</p>
      <h1>{query ? `${ar ? "نتائج البحث عن" : "Results for"} “${q}”` : ar ? "البحث" : "Search"}</h1>
      {results.length ? <div className="product-grid">{results.map((product) => <ProductCard product={product} locale={locale} key={product.slug} />)}</div> : <div className="empty-card"><p>{ar ? "لم نجد منتجات مطابقة. جرّب كلمة أخرى." : "No matching products. Try another search."}</p></div>}
    </main>
  );
}
