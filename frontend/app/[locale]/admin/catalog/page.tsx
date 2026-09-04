import { notFound } from "next/navigation";
import { AdminCatalogPromotions } from "@/components/admin-catalog-promotions";
import { isLocale } from "@/lib/i18n";

export default async function AdminCatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AdminCatalogPromotions locale={locale} />;
}
