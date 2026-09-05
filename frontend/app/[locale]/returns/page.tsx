import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal-page";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const title = locale === "ar" ? "سياسة الاسترجاع والتبديل | Xvond Smart Store" : "Return & Exchange Policy | Xvond Smart Store";
  const description = locale === "ar" ? "سياسة الاسترجاع والتبديل والاسترداد في Xvond Smart Store." : "Returns, exchanges, and refunds policy for Xvond Smart Store.";
  return { title, description, alternates: { canonical: absoluteUrl(`/${locale}/returns`) } };
}

export default async function ReturnsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPage locale={locale} kind="returns" />;
}
