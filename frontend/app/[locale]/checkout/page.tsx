import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { CheckoutView } from "@/components/checkout-view";

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CheckoutView locale={locale} />;
}

