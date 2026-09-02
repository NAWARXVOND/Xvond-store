import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { products } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";

export default async function SearchPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ q?: string }> }) {
  const [{ locale }, { q = "" }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const query = q.trim().toLocaleLowerCase(locale);
  const results = query ? products.filter((product) => `${product.name.ar} ${product.name.en}`.toLocaleLowerCase(locale).includes(query)) : [];
  const ar = locale === "ar";
  return <main className="content-page shell"><p className="eyebrow">XVOND SEARCH</p><h1>{query ? `${ar ? "نتائج البحث عن" : "Results for"} “${q}”` : ar ? "البحث" : "Search"}</h1>{results.length ? <div className="product-grid">{results.map((product) => <ProductCard product={product} locale={locale} key={product.slug} />)}</div> : <div className="empty-card"><p>{ar ? "لم نجد منتجات مطابقة. جرّب كلمة أخرى." : "No matching products. Try another search."}</p></div>}</main>;
}

