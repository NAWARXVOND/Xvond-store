import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal-page";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const title = locale === "ar" ? "شروط الاستخدام | Xvond Smart Store" : "Terms of Use | Xvond Smart Store";
  const description = locale === "ar" ? "شروط استخدام Xvond Smart Store والشراء منه." : "Terms governing use of and purchases from Xvond Smart Store.";
  return { title, description, alternates: { canonical: absoluteUrl(`/${locale}/terms`) } };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPage locale={locale} kind="terms" />;
}
