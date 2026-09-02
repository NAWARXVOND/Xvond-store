import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { TrackOrderView } from "@/components/track-order-view";

export default async function TrackOrderPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ order?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  return <TrackOrderView locale={locale} initialOrder={query.order || ""} />;
}

