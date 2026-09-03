import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoreGateway } from "@/components/store-gateway";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ar = locale === "ar";
  return {
    title: ar ? "Xvond Store | اختر متجرك" : "Xvond Store | Choose Your Store",
    description: ar ? "اختر بين Xvond Lifestyle Store وXvond Smart Store ضمن تجربة Xvond Store." : "Choose between Xvond Lifestyle Store and Xvond Smart Store inside Xvond Store.",
    alternates: { canonical: absoluteUrl(`/${locale}`), languages: { "ar-OM": absoluteUrl("/ar"), "en-OM": absoluteUrl("/en") } }
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <StoreGateway locale={locale} />;
}
