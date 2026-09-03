import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";

export function StoreGateway({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <main className="store-gateway">
      <section className="store-gateway-grid" aria-label={ar ? "اختر متجر Xvond" : "Choose an Xvond store"}>
        <Link href={`/${locale}/lifestyle`} className="store-gateway-card lifestyle-gateway-card">
          <span className="store-gateway-brand">XVOND</span>
          <div className="store-gateway-title">
            <h1>Lifestyle</h1>
            <strong>Store</strong>
          </div>
          <span className="store-gateway-enter">{ar ? "دخول المتجر" : "Enter store"}<Arrow /></span>
        </Link>

        <Link href={`/${locale}/smart`} className="store-gateway-card smart-gateway-card">
          <span className="store-gateway-brand">XVOND</span>
          <div className="store-gateway-title">
            <h1>Smart</h1>
            <strong>Store</strong>
          </div>
          <span className="store-gateway-enter">{ar ? "دخول المتجر" : "Enter store"}<Arrow /></span>
        </Link>
      </section>
    </main>
  );
}
