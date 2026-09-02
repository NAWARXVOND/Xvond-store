import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal-page";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const title = locale === "ar" ? "سياسة الخصوصية | Xvond Store" : "Privacy Policy | Xvond Store";
  const description = locale === "ar" ? "سياسة الخصوصية وحماية البيانات الشخصية في Xvond Store." : "Privacy and personal-data policy for Xvond Store.";
  return { title, description, alternates: { canonical: absoluteUrl(`/${locale}/privacy`) } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LegalPage locale={locale} kind="privacy" />;
}
