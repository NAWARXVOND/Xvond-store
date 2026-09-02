import Link from "next/link";
import type { Locale } from "@/lib/i18n";

export function StoreFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="footer">
      <div className="footer-brand">
        <span className="brand-mark">X</span>
        <div><strong>Xvond Store</strong><p>{locale === "ar" ? "اختيارات تليق بذوقك." : "Curated for your taste."}</p></div>
      </div>
      <div className="footer-links">
        <Link href={`/${locale}/category/women`}>{locale === "ar" ? "تسوّق" : "Shop"}</Link>
        <Link href={`/${locale}/track-order`}>{locale === "ar" ? "تتبع الطلب" : "Track order"}</Link>
        <Link href={`/${locale}/account`}>{locale === "ar" ? "حسابي" : "My account"}</Link>
      </div>
      <p className="copyright">© {new Date().getFullYear()} Xvond Store</p>
    </footer>
  );
}

