import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function StoreFooter({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span className="brand-mark">X</span>
        <div><strong>Xvond Store</strong><p>{ar ? "اختيارات تليق بذوقك." : "Curated for your taste."}</p></div>
      </div>
      <div className="footer-links">
        <Link href={`/${locale}/category/women`}>{ar ? "تسوّق" : "Shop"}</Link>
        <Link href={`/${locale}/track-order`}>{ar ? "تتبع الطلب" : "Track order"}</Link>
        <Link href={`/${locale}/account`}>{ar ? "حسابي" : "My account"}</Link>
        <Link href={`/${locale}/privacy`}>{ar ? "سياسة الخصوصية" : "Privacy"}</Link>
        <Link href={`/${locale}/terms`}>{ar ? "شروط الاستخدام" : "Terms"}</Link>
        <Link href={`/${locale}/returns`}>{ar ? "الاسترجاع والتبديل" : "Returns & Exchanges"}</Link>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Xvond Store</p>
    </footer>
  );
}
