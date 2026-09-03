import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreHome } from "@/components/store-home";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";
import { getCategories, getProducts } from "@/lib/catalog";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ar = locale === "ar";
  return {
    title: ar ? "Xvond Store | تسوّق باختيار مختلف" : "Xvond Store | Curated Shopping",
    description: ar ? "تسوّق النساء والأطفال والإلكترونيات وXvond Box والهدايا الفاخرة في Xvond Store." : "Shop curated women, kids, electronics, Xvond Box and luxury gifts at Xvond Store.",
    alternates: { canonical: absoluteUrl(`/${locale}`), languages: { "ar-OM": absoluteUrl("/ar"), "en-OM": absoluteUrl("/en") } }
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [categories, products] = await Promise.all([getCategories(), getProducts({ limit: 12 })]);
  return <StoreHome locale={locale} categories={categories} products={products} />;
}
