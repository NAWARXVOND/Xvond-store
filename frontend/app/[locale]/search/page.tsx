import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";

type SearchQuery = { q?: string; store?: string };

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<SearchQuery> }) {
  const [{ locale }, { q = "" }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const query = q.trim();
  const allResults = query ? await getProducts({ query, limit: 60 }) : [];
  const results = allResults;
  const ar = locale === "ar";
  const storeName = "Xvond Smart Store";

  return (
    <main className="content-page shell">
      <Link href={`/${locale}`} className="secondary-button">← {storeName}</Link>
      <p className="eyebrow" style={{ marginTop: "2rem" }}>{storeName.toUpperCase()}</p>
      <h1>{query ? `${ar ? "نتائج البحث عن" : "Results for"} “${q}”` : ar ? "البحث" : "Search"}</h1>
      {results.length ? <div className="product-grid">{results.map((product) => <ProductCard product={product} locale={locale} key={product.slug} />)}</div> : <div className="empty-card"><p>{ar ? "لم نجد منتجات مطابقة. جرّب كلمة أخرى." : "No matching products. Try another search."}</p></div>}
    </main>
  );
}
