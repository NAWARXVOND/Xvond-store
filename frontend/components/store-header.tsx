"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { useCommerce } from "./commerce-provider";

const departments = [
  ["women", "نساء", "Women"],
  ["kids", "أطفال", "Kids"],
  ["electronics", "إلكترونيات", "Electronics"],
  ["xvond-box", "Xvond Box", "Xvond Box"],
  ["luxury-gifts", "هدايا", "Gifts"],
  ["automotive", "سيارات", "Automotive"],
] as const;

export function StoreHeader({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const pathname = usePathname();
  const { cartCount } = useCommerce();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const languagePath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const ar = locale === "ar";

  return (
    <header className="site-header marketplace-header">
      <div className="announcement marketplace-announcement">
        <span>{ar ? "تسوّق مختارات Xvond في مكان واحد" : "Shop Xvond selections in one place"}</span>
        <Link href={`/${locale}/track-order`}>{ar ? "تتبع طلبك" : "Track order"}</Link>
      </div>
      <div className="header-shell marketplace-header-shell">
        <Link href={`/${locale}`} className="brand" aria-label="Xvond Store home">
          <span className="brand-mark">X</span>
          <span><strong>Xvond</strong><small>STORE</small></span>
        </Link>
        <form className="search-box marketplace-search" action={`/${locale}/search`}>
          <MagnifyingGlassIcon />
          <input name="q" type="search" placeholder={ar ? "ابحث عن منتجات، أقسام، هدايا..." : "Search products, departments, gifts..."} aria-label={t.search} />
          <button type="submit">{ar ? "بحث" : "Search"}</button>
        </form>
        <nav className="header-actions marketplace-actions" aria-label={ar ? "أدوات المتجر" : "Store tools"}>
          <Link href={languagePath || `/${otherLocale}`} className="language-switch" hrefLang={otherLocale}>{otherLocale.toUpperCase()}</Link>
          <Link href={`/${locale}/account`} className="header-tool"><UserCircleIcon /><span>{ar ? "حسابي" : "Account"}</span></Link>
          <Link href={`/${locale}/wishlist`} className="header-tool"><HeartIcon /><span>{t.wishlist}</span></Link>
          <Link href={`/${locale}/cart`} className="header-tool cart-link"><ShoppingBagIcon /><span className="tool-label">{t.cart}</span><b>{cartCount}</b></Link>
        </nav>
      </div>
      <nav className="department-nav shell" aria-label={ar ? "الأقسام الرئيسية" : "Main departments"}>
        <Link href={`/${locale}/shop`} className="all-departments">{ar ? "كل الأقسام" : "All departments"}</Link>
        {departments.map(([slug, arLabel, enLabel]) => <Link key={slug} href={`/${locale}/category/${slug}`}>{ar ? arLabel : enLabel}</Link>)}
        <Link href={`/${locale}/category/new-arrivals`}>{ar ? "وصل حديثًا" : "New arrivals"}</Link>
      </nav>
    </header>
  );
}
