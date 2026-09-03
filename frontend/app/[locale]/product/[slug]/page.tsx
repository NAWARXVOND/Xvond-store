import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getProduct } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { storeForCategorySlug, storeHomePath } from "@/lib/store-context";
import { absoluteUrl } from "@/lib/urls";
import { ProductPurchase } from "@/components/product-purchase";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: product.name[locale],
    description: product.description[locale] || `${product.name[locale]} — Xvond Store`,
    alternates: { canonical: absoluteUrl(`/${locale}/product/${slug}`) },
    openGraph: { title: product.name[locale], images: [product.image] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = await getProduct(slug);
  if (!product) notFound();
  const ar = locale === "ar";
  const store = storeForCategorySlug(product.category);
  if (!store) notFound();
  const storeName = store === "lifestyle" ? "Xvond Lifestyle Store" : "Xvond Smart Store";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name[locale],
    description: product.description[locale],
    image: [product.image],
    sku: product.sku,
    offers: {
      "@type": "Offer",
      priceCurrency: "OMR",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: absoluteUrl(`/${locale}/product/${slug}`),
    },
  };
  return (
    <main className="content-page shell">
      <Link href={storeHomePath(locale, store)} className="secondary-button">← {storeName}</Link>
      <div className="box-feature product-detail" style={{ marginTop: "1.5rem" }}>
        <div className="hero-visual"><Image src={product.image} alt={product.name[locale]} fill sizes="(max-width: 800px) 100vw, 50vw" /></div>
        <div className="feature-copy">
          <p className="eyebrow">{storeName.toUpperCase()}</p>
          <h1>{product.name[locale]}</h1>
          <div className="price-line"><strong>{formatPrice(product.price, locale)}</strong>{product.previousPrice && <del>{formatPrice(product.previousPrice, locale)}</del>}</div>
          {product.description[locale] && <p>{product.description[locale]}</p>}
          <p className={product.stock > 0 ? "stock-ready" : "stock-empty"}>{product.stock > 0 ? (ar ? `متوفر — ${product.stock} قطعة` : `In stock — ${product.stock} items`) : (ar ? "غير متوفر حاليًا" : "Currently out of stock")}</p>
          <ProductPurchase product={product} locale={locale} />
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </main>
  );
}
