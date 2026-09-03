import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getProducts } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { LIFESTYLE_CATEGORY_SLUGS } from "@/lib/store-context";
import { absoluteUrl } from "@/lib/urls";
import styles from "../../store-channel.module.css";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: locale === "ar" ? "وصل حديثًا | Xvond Lifestyle Store" : "New Arrivals | Xvond Lifestyle Store",
    alternates: { canonical: absoluteUrl(`/${locale}/lifestyle/new-arrivals`) },
  };
}

export default async function LifestyleNewArrivalsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  const allowed = new Set<string>(LIFESTYLE_CATEGORY_SLUGS);
  const products = (await getProducts({ sort: "newest", limit: 60 })).filter((product) => allowed.has(product.category));

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>XVOND LIFESTYLE STORE</p>
          <h1>{ar ? "وصل حديثًا" : "New Arrivals"}</h1>
        </div>
      </section>
      <section className={styles.section}>
        {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div> : <div className="empty-card"><p>{ar ? "ما في منتجات جديدة حاليًا." : "No new products right now."}</p></div>}
      </section>
    </main>
  );
}
