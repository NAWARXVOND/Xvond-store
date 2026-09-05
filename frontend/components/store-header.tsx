"use client";

import { StoreLogo } from "./store-logo";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";
import { copy } from "@/lib/i18n";
import { appendStoreContext, storeForPath, storeNewArrivalsPath } from "@/lib/store-context";
import { useCommerce } from "./commerce-provider";

type HeaderProfile = { id: string; full_name: string; email: string | null; phone?: string | null };
type SessionResponse = { authenticated: boolean; profile?: HeaderProfile | null };
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function StoreBrand({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="brand brand-logo" aria-label={label}>
      <StoreLogo className="header-store-logo" priority />
    </Link>
  );
}

export function StoreHeader({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cartCount } = useCommerce();
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const otherLocale = locale === "ar" ? "en" : "ar";
  const hintedStore = searchParams.get("store");
  const store = storeForPath(pathname, locale, hintedStore);
  const languagePath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const languageHref = appendStoreContext(languagePath || `/${otherLocale}`, store);
  const ar = locale === "ar";
  const gateway = pathname === `/${locale}`;
  const admin = pathname.startsWith(`/${locale}/admin`);

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/auth/session`, { credentials: "include", cache: "no-store" });
      if (!response.ok) {
        setProfile(null);
        return;
      }
      const session = await response.json() as SessionResponse;
      setProfile(session.authenticated ? session.profile ?? null : null);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void loadProfile());
    const refresh = () => void loadProfile();
    window.addEventListener("xvond-account-changed", refresh);
    return () => window.removeEventListener("xvond-account-changed", refresh);
  }, [loadProfile]);

  if (admin) return null;

  if (gateway) {
    return (
      <header className="site-header gateway-header">
        <div className="header-shell gateway-header-shell">
          <StoreBrand href={`/${locale}`} label="Xvond Store home" />
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
  const initials = profile?.full_name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "";
  const accountLabel = profile?.full_name || (ar ? "تسجيل الدخول" : "Sign in");

  return (
    <header className="site-header marketplace-header">
      <div className="announcement marketplace-announcement">
        <span>{storeName}</span>
      </div>
      <div className="header-shell marketplace-header-shell">
        <StoreBrand href={store ? `/${locale}/${store}` : `/${locale}`} label={`${storeName} home`} />
        <form className="search-box marketplace-search" action={`/${locale}/search`}>
          <MagnifyingGlassIcon />
          <input name="q" type="search" placeholder={searchPlaceholder} aria-label={t.search} />
          {store && <input type="hidden" name="store" value={store} />}
          <button type="submit">{ar ? "بحث" : "Search"}</button>
        </form>
        <nav className="header-actions marketplace-actions" aria-label={ar ? "أدوات المتجر" : "Store tools"}>
          <Link href={languageHref} className="language-switch" hrefLang={otherLocale}>{otherLocale.toUpperCase()}</Link>
          <Link
            href={accountHref}
            className="header-tool"
            aria-label={accountLabel}
            style={{ width: "auto", minWidth: "38px", borderRadius: "999px", paddingInline: ".35rem .65rem", display: "flex", gap: ".45rem" }}
          >
            {profile ? (
              <>
                <span aria-hidden="true" style={{ width: "30px", height: "30px", display: "grid", placeItems: "center", flex: "0 0 auto", borderRadius: "50%", background: "linear-gradient(145deg, #168cff, #074ac8)", color: "white", fontSize: ".68rem", fontWeight: 800 }}>{initials}</span>
                <span style={{ maxWidth: "110px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: ".72rem", fontWeight: 700 }}>{profile.full_name}</span>
              </>
            ) : (
              <><UserCircleIcon /><span>{ar ? "تسجيل الدخول" : "Sign in"}</span></>
            )}
          </Link>
          <Link href={wishlistHref} className="header-tool"><HeartIcon /><span>{t.wishlist}</span></Link>
          <Link href={cartHref} className="header-tool cart-link" aria-label={t.cart}><ShoppingBagIcon /><b>{cartCount}</b></Link>
        </nav>
      </div>

      {lifestyle ? (
        <nav className="department-nav shell" aria-label="Xvond Lifestyle Store">
          <Link href={`/${locale}/lifestyle`} className="all-departments">Lifestyle</Link>
          <Link href={`/${locale}/category/women`}>{ar ? "نساء" : "Women"}</Link>
          <Link href={`/${locale}/category/kids`}>{ar ? "أطفال" : "Kids"}</Link>
          <Link href={`/${locale}/category/luxury-gifts`}>{ar ? "هدايا" : "Gifts"}</Link>
          <Link href={`/${locale}/category/automotive`}>{ar ? "السيارة" : "Automotive"}</Link>
          <Link href={`/${locale}/category/xvond-box`}>Xvond Box</Link>
          <Link href={storeNewArrivalsPath(locale, "lifestyle")}>{ar ? "وصل حديثًا" : "New arrivals"}</Link>
          <Link href={`/${locale}/smart`}>{ar ? "انتقل إلى Smart" : "Switch to Smart"}</Link>
        </nav>
      ) : smart ? (
        <nav className="department-nav shell" aria-label="Xvond Smart Store">
          <Link href={`/${locale}/smart`} className="all-departments">Smart</Link>
          <Link href={`/${locale}/category/electronics`}>Smart Tech</Link>
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
