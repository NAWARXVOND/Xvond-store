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
    <Link href={href} className="brand brand-logo" aria-label={label} style={{ gap: ".62rem", minWidth: 0 }}>
      <span
        aria-hidden="true"
        style={{
          width: "60px",
          height: "60px",
          display: "grid",
          placeItems: "start center",
          flex: "0 0 auto",
          overflow: "hidden",
          background: "transparent",
          border: 0,
          filter: "drop-shadow(0 0 9px rgba(22,140,255,.26))",
        }}
      >
        <StoreLogo
          size={94}
          priority
          style={{
            width: "94px",
            height: "94px",
            maxWidth: "none",
            flex: "0 0 auto",
            transform: "translateY(-2px)",
            filter: "brightness(1.08) contrast(1.08) saturate(1.08)",
          }}
        />
      </span>
      <span style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: ".12rem", minWidth: 0, whiteSpace: "nowrap" }}>
        <strong
          style={{
            fontSize: "clamp(1.12rem, 1.7vw, 1.48rem)",
            fontWeight: 800,
            letterSpacing: "-.045em",
            lineHeight: .94,
            color: "#37b9ff",
            textShadow: "0 0 7px rgba(80,213,255,.72), 0 0 18px rgba(22,140,255,.42)",
          }}
        >
          Xvond
        </strong>
        <span
          style={{
            color: "#f7fbff",
            fontSize: "clamp(.57rem, .82vw, .72rem)",
            fontWeight: 700,
            letterSpacing: ".13em",
            lineHeight: 1,
            textTransform: "uppercase",
            textShadow: "0 0 7px rgba(255,255,255,.45), 0 0 13px rgba(80,213,255,.18)",
          }}
        >
          Smart Store
        </span>
      </span>
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
