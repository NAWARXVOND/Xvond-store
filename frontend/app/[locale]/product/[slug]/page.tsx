import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { formatPrice, products } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const product = products.find((item) => item.slug === slug);
  if (!product) return {};
  return { title: product.name[locale], description: `${product.name[locale]} — Xvond Store`, alternates: { canonical: absoluteUrl(`/${locale}/product/${slug}`) }, openGraph: { title: product.name[locale], images: [product.image] } };
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const product = products.find((item) => item.slug === slug);
  if (!product) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name[locale], image: [product.image], sku: product.slug, offers: { "@type": "Offer", priceCurrency: "OMR", price: product.price, availability: "https://schema.org/InStock", url: absoluteUrl(`/${locale}/product/${slug}`) } };
  return <main className="content-page shell"><div className="box-feature"><div className="hero-visual"><Image src={product.image} alt={product.name[locale]} fill sizes="50vw" /></div><div className="feature-copy"><p className="eyebrow">XVOND SELECTED</p><h1>{product.name[locale]}</h1><p>{formatPrice(product.price, locale)}</p><button className="primary-button" type="button">{locale === "ar" ? "أضف إلى السلة" : "Add to cart"}</button></div></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /></main>;
}

