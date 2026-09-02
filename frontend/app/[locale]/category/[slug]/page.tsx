import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { categories, products } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const category = categories.find((item) => item.slug === slug);
  const title = category?.label[locale] || (locale === "ar" ? "المنتجات" : "Products");
  return { title, alternates: { canonical: absoluteUrl(`/${locale}/category/${slug}`) } };
}

export default async function CategoryPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const category = categories.find((item) => item.slug === slug);
  const title = category?.label[locale] || (locale === "ar" ? "وصل حديثًا" : "New Arrivals");
  const visible = category ? products.filter((product) => product.category === category.slug) : products;
  return <main className="content-page shell"><h1>{title}</h1><div className="product-grid">{visible.map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div></main>;
}

