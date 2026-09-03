import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CpuChipIcon, SparklesIcon } from "@heroicons/react/24/outline";
import type { Locale } from "@/lib/i18n";

export function StoreGateway({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <main className="store-gateway">
      <section className="store-gateway-shell shell">
        <div className="store-gateway-brand">
          <span className="store-gateway-kicker">XVOND STORE</span>
          <h1>{ar ? "اختر متجرك" : "Choose your store"}</h1>
          <p>{ar ? "تجربتان مختلفتان تحت Xvond. اختر المسار المناسب لك وابدأ التسوق." : "Two distinct shopping experiences under Xvond. Choose your path and start shopping."}</p>
        </div>

        <div className="store-gateway-grid">
          <Link href={`/${locale}/lifestyle`} className="store-gateway-card lifestyle-gateway-card">
            <div className="store-gateway-icon"><SparklesIcon /></div>
            <div className="store-gateway-copy">
              <span>XVOND</span>
              <h2>Lifestyle Store</h2>
              <p>{ar ? "أزياء، أطفال، هدايا، سيارات ومنتجات يومية مختارة بعناية." : "Fashion, kids, gifts, automotive and curated everyday products."}</p>
              <b>{ar ? "ادخل Lifestyle Store" : "Enter Lifestyle Store"}<Arrow /></b>
            </div>
          </Link>

          <Link href={`/${locale}/smart`} className="store-gateway-card smart-gateway-card">
            <div className="store-gateway-icon"><CpuChipIcon /></div>
            <div className="store-gateway-copy">
              <span>XVOND</span>
              <h2>Smart Store</h2>
              <p>{ar ? "تقنية ذكية، Xvond Box، وأجهزة ومنتجات ترتبط تدريجيًا بعالم Xvond AI." : "Smart technology, Xvond Box, and products that progressively connect to the Xvond AI ecosystem."}</p>
              <b>{ar ? "ادخل Smart Store" : "Enter Smart Store"}<Arrow /></b>
            </div>
          </Link>
        </div>

        <div className="store-gateway-footer">
          <Link href={`/${locale}/shop`}>{ar ? "أو استعرض كل المنتجات" : "Or browse all products"}<Arrow /></Link>
        </div>
      </section>
    </main>
  );
}
