"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { useCommerce } from "./commerce-provider";

export function StoreHeader({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const pathname = usePathname();
  const { cartCount } = useCommerce();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const languagePath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <header className="site-header">
      <div className="announcement">
        {locale === "ar" ? "تجربة تسوّق مختارة بعناية لعُمان" : "A curated shopping experience for Oman"}
      </div>
      <div className="header-shell">
        <Link href={`/${locale}`} className="brand" aria-label="Xvond Store home">
          <span className="brand-mark">X</span>
          <span><strong>Xvond</strong><small>STORE</small></span>
        </Link>

        <form className="search-box" action={`/${locale}/search`}>
          <MagnifyingGlassIcon />
          <input name="q" type="search" placeholder={t.search} aria-label={t.search} />
        </form>

        <nav className="header-actions" aria-label={locale === "ar" ? "أدوات المتجر" : "Store tools"}>
          <Link href={languagePath || `/${otherLocale}`} className="language-switch" hrefLang={otherLocale}>
            {otherLocale.toUpperCase()}
          </Link>
          <Link href={`/${locale}/wishlist`} aria-label={t.wishlist}><HeartIcon /></Link>
          <Link href={`/${locale}/cart`} aria-label={t.cart} className="cart-link">
            <ShoppingBagIcon /><span>{cartCount}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
