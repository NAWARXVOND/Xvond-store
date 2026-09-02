import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { WishlistView } from "@/components/wishlist-view";
import { getProducts } from "@/lib/catalog";

export default async function WishlistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const products = await getProducts({ limit: 100 });
  return <WishlistView locale={locale} products={products} />;
}
