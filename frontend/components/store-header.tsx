"use client";

import { StoreLogo } from "./store-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HeartIcon, MagnifyingGlassIcon, ShoppingBagIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";
import { STORE_CATEGORIES } from "@/lib/catalog";
import { copy } from "@/lib/i18n";
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
  const { cartCount } = useCommerce();
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const otherLocale = locale === "ar" ? "en" : "ar";
  const languagePath = pathname.replace(`/${locale}`, `/${otherLocale}`);
  const languageHref = languagePath || `/${otherLocale}`;
  const ar = locale === "ar";
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

  const storeName = "Xvond Smart Store";
  const searchPlaceholder = ar ? "ابحث في Xvond Smart Store..." : "Search Xvond Smart Store...";
  const accountHref = `/${locale}/account`;
  const wishlistHref = `/${locale}/wishlist`;
  const cartHref = `/${locale}/cart`;
  const initials = profile?.full_name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "";
  const accountLabel = profile?.full_name || (ar ? "تسجيل الدخول" : "Sign in");

  return (
    <header className="site-header marketplace-header">
      <div className="announcement marketplace-announcement">
        <span>{storeName}</span>
      </div>
      <div className="header-shell marketplace-header-shell">
        <StoreBrand href={`/${locale}`} label={`${storeName} home`} />
        <form className="search-box marketplace-search" action={`/${locale}/search`}>
          <MagnifyingGlassIcon />
          <input name="q" type="search" placeholder={searchPlaceholder} aria-label={t.search} />
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

      <nav className="department-nav shell" aria-label={ar ? "أقسام المتجر" : "Store categories"}>
        <Link href={`/${locale}`} className="all-departments">{ar ? "الرئيسية" : "Home"}</Link>
        {STORE_CATEGORIES.map((category) => (
          <Link key={category.slug} href={`/${locale}/category/${category.slug}`}>{category.label[locale]}</Link>
        ))}
        <Link href={`/${locale}/new-arrivals`}>{ar ? "وصل حديثًا" : "New arrivals"}</Link>
      </nav>
    </header>
  );
}
