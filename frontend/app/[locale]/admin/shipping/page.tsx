import { notFound } from "next/navigation";
import { ShippingAdmin } from "@/components/shipping-admin";
import { isLocale } from "@/lib/i18n";

export default async function ShippingAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <ShippingAdmin locale={locale} />;
}
