import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: locale === "ar" ? "وصل حديثًا" : "New Arrivals", alternates: { canonical: absoluteUrl(`/${locale}/new-arrivals`) } };
}

export default async function NewArrivalsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ page?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  const requestedPage = Number(query.page ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 100000 ? requestedPage : 1;
  const pageSize = 24;
  const products = await getProducts({ sort: "newest", limit: pageSize, offset: (page - 1) * pageSize });
  return (
    <main className="content-page shell">
      <p className="eyebrow">XVOND SMART STORE</p><h1>{ar ? "وصل حديثًا" : "New Arrivals"}</h1>
      {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div> : <div className="empty-card"><p>{ar ? "لا توجد منتجات إضافية حاليًا." : "No more products right now."}</p></div>}
      <nav className="actions" aria-label={ar ? "صفحات المنتجات" : "Product pages"} style={{ marginTop: "2rem" }}>
        {page > 1 && <Link className="secondary-button" href={`/${locale}/new-arrivals?page=${page - 1}`}>{ar ? "السابق" : "Previous"}</Link>}
        {products.length === pageSize && <Link className="secondary-button" href={`/${locale}/new-arrivals?page=${page + 1}`}>{ar ? "التالي" : "Next"}</Link>}
      </nav>
    </main>
  );
}
