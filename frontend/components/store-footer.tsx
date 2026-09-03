"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/lib/i18n";
import { appendStoreContext, storeForPath } from "@/lib/store-context";

export function StoreFooter({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ar = locale === "ar";
  const store = storeForPath(pathname, locale, searchParams.get("store"));

  if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/admin`)) return null;

  const storeName = store === "lifestyle" ? "Xvond Lifestyle Store" : store === "smart" ? "Xvond Smart Store" : "Xvond Store";
  const shopHref = store ? `/${locale}/${store}` : `/${locale}`;

  return (
    <footer className="footer">
      <div className="footer-brand">
        <span className="brand-mark">X</span>
        <div><strong>{storeName}</strong><p>Xvond Store</p></div>
      </div>
      <div className="footer-links">
        <Link href={shopHref}>{ar ? "المتجر" : "Store"}</Link>
        <Link href={appendStoreContext(`/${locale}/track-order`, store)}>{ar ? "تتبع الطلب" : "Track order"}</Link>
        <Link href={appendStoreContext(`/${locale}/account`, store)}>{ar ? "حسابي" : "My account"}</Link>
        <Link href={`/${locale}/privacy`}>{ar ? "سياسة الخصوصية" : "Privacy"}</Link>
        <Link href={`/${locale}/terms`}>{ar ? "شروط الاستخدام" : "Terms"}</Link>
        <Link href={`/${locale}/returns`}>{ar ? "الاسترجاع والتبديل" : "Returns & Exchanges"}</Link>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Xvond Store</p>
    </footer>
  );
}
