"use client";

import { StoreLogo } from "./store-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/lib/i18n";

export function StoreFooter({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const ar = locale === "ar";

  if (pathname.startsWith(`/${locale}/admin`)) return null;

  const storeName = "Xvond Smart Store";
  const shopHref = `/${locale}`;

  return (
    <footer className="footer">
      <div className="footer-brand">
        <StoreLogo size={120} />
        <div><strong>{storeName}</strong><p>{ar ? "تقنية مختارة لحياتك اليومية" : "Selected tech for everyday life"}</p></div>
      </div>
      <div className="footer-links">
        <Link href={shopHref}>{ar ? "المتجر" : "Store"}</Link>
        <Link href={`/${locale}/privacy`}>{ar ? "سياسة الخصوصية" : "Privacy"}</Link>
        <Link href={`/${locale}/terms`}>{ar ? "شروط الاستخدام" : "Terms"}</Link>
        <Link href={`/${locale}/returns`}>{ar ? "الاسترجاع والتبديل" : "Returns & Exchanges"}</Link>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Xvond Smart Store</p>
    </footer>
  );
}
