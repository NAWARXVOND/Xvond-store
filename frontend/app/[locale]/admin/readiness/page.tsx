import { notFound } from "next/navigation";
import { LaunchReadiness } from "@/components/launch-readiness";
import { isLocale } from "@/lib/i18n";

export default async function LaunchReadinessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <LaunchReadiness locale={locale} />;
}
