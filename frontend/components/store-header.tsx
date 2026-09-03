"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { appendStoreContext, storeForPath, storeNewArrivalsPath } from "@/lib/store-context";
import { useCommerce } from "./commerce-provider";

export function StoreHeader({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartCount } = useCommerce();
  const otherLocale = locale === "ar" ? "en" : "ar";
  const hintedStore = searchParams.get("store");
  const store = storeForPath(pathname, locale, hintedStore);
  const languagePath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const languageHref = appendStoreContext(languagePath || `/${otherLocale}`, store);
  const ar = locale === "ar";
  const gateway = pathname === `/${locale}`;
  const admin = pathname.startsWith(`/${locale}/admin`);

  if (admin) return null;

  if (gateway) {
    return (
      <header className="site-header gateway-header">
        <div className="header-shell gateway-header-shell">
          <Link href={`/${locale}`} className="brand" aria-label="Xvond Store home">
            <span className="brand-mark">X</span>
            <span><strong>Xvond</strong><small>STORE</small></span>
          </Link>
          <Link href={languagePath || `/${otherLocale}`} className="language-switch" hrefLang={otherLocale}>{otherLocale.toUpperCase()}</Link>
        </div>
      </header>
    );
  }

  const lifestyle = store === "lifestyle";
  const smart = store === "smart";
  const storeName = lifestyle ? "Xvond Lifestyle Store" : smart ? "Xvond Smart Store" : "Xvond Store";
  const searchPlaceholder = lifestyle
    ? (ar ? "ابحث في Lifestyle..." : "Search Lifestyle...")
    : smart
      ? (ar ? "ابحث في Smart..." : "Search Smart...")
      : (ar ? "ابحث في Xvond Store..." : "Search Xvond Store...");
  const accountHref = appendStoreContext(`/${locale}/account`, store);
  const wishlistHref = appendStoreContext(`/${locale}/wishlist`, store);
  const cartHref = appendStoreContext(`/${locale}/cart`, store);
  const trackHref = appendStoreContext(`/${locale}/track-order`, store);

  return (
    <header className="site-header marketplace-header">
      <div className="announcement marketplace-announcement">
        <span>{storeName}</span>
        <Link href={trackHref}>{ar ? "تتبع طلبك" : "Track order"}</Link>
      </div>
      <div className="header-shell marketplace-header-shell">
        <Link href={store ? `/${locale}/${store}` : `/${locale}`} className="brand" aria-label={`${storeName} home`}>
          <span className="brand-mark">X</span>
          <span><strong>Xvond</strong><small>{store ? store.toUpperCase() : "STORE"}</small></span>
        </Link>
        <form className="search-box marketplace-search" action={`/${locale}/search`}>
          <MagnifyingGlassIcon />
          <input name="q" type="search" placeholder={searchPlaceholder} aria-label={t.search} />
          {store && <input type="hidden" name="store" value={store} />}
          <button type="submit">{ar ? "بحث" : "Search"}</button>
        </form>
        <nav className="header-actions marketplace-actions" aria-label={ar ? "أدوات المتجر" : "Store tools"}>
          <Link href={languageHref} className="language-switch" hrefLang={otherLocale}>{otherLocale.toUpperCase()}</Link>
          <Link href={accountHref} className="header-tool"><UserCircleIcon /><span>{ar ? "حسابي" : "Account"}</span></Link>
          <Link href={wishlistHref} className="header-tool"><HeartIcon /><span>{t.wishlist}</span></Link>
          <Link href={cartHref} className="header-tool cart-link"><ShoppingBagIcon /><span className="tool-label">{t.cart}</span><b>{cartCount}</b></Link>
        </nav>
      </div>

      {lifestyle ? (
        <nav className="department-nav shell" aria-label="Xvond Lifestyle Store">
          <Link href={`/${locale}/lifestyle`} className="all-departments">Lifestyle</Link>
          <Link href={`/${locale}/category/women`}>{ar ? "نساء" : "Women"}</Link>
          <Link href={`/${locale}/category/kids`}>{ar ? "أطفال" : "Kids"}</Link>
          <Link href={`/${locale}/category/luxury-gifts`}>{ar ? "هدايا" : "Gifts"}</Link>
          <Link href={`/${locale}/category/automotive`}>{ar ? "السيارة" : "Automotive"}</Link>
          <Link href={storeNewArrivalsPath(locale, "lifestyle")}>{ar ? "وصل حديثًا" : "New arrivals"}</Link>
          <Link href={`/${locale}/smart`}>{ar ? "انتقل إلى Smart" : "Switch to Smart"}</Link>
        </nav>
      ) : smart ? (
        <nav className="department-nav shell" aria-label="Xvond Smart Store">
          <Link href={`/${locale}/smart`} className="all-departments">Smart</Link>
          <Link href={`/${locale}/category/electronics`}>Smart Tech</Link>
          <Link href={`/${locale}/category/xvond-box`}>Xvond Box</Link>
          <Link href={storeNewArrivalsPath(locale, "smart")}>{ar ? "وصل حديثًا" : "New arrivals"}</Link>
          <Link href={`/${locale}/lifestyle`}>{ar ? "انتقل إلى Lifestyle" : "Switch to Lifestyle"}</Link>
        </nav>
      ) : (
        <nav className="department-nav shell" aria-label={ar ? "متاجر Xvond" : "Xvond stores"}>
          <Link href={`/${locale}`} className="all-departments">Xvond Store</Link>
          <Link href={`/${locale}/lifestyle`}>Lifestyle Store</Link>
          <Link href={`/${locale}/smart`}>Smart Store</Link>
        </nav>
      )}
    </header>
  );
}
