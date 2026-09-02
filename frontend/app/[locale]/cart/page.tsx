import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { CartView } from "@/components/cart-view";

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <CartView locale={locale} />;
}

