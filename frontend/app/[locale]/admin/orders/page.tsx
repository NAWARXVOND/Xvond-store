import { notFound } from "next/navigation";
import { OrderFulfillmentAdmin } from "@/components/order-fulfillment-admin";
import { isLocale } from "@/lib/i18n";

export default async function OrdersAdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <OrderFulfillmentAdmin locale={locale} />;
}
