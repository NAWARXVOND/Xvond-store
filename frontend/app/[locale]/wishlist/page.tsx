import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { WishlistView } from "@/components/wishlist-view";

export default async function WishlistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <WishlistView locale={locale} />;
}

