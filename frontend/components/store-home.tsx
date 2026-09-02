import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckBadgeIcon, LifebuoyIcon, TruckIcon } from "@heroicons/react/24/outline";
import { categories, products } from "@/lib/catalog";
import { copy, type Locale } from "@/lib/i18n";
import { ProductCard } from "./product-card";

export function StoreHome({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const Arrow = locale === "ar" ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <main>
      <section className="hero shell">
        <div className="hero-content">
          <p className="eyebrow">{t.heroEyebrow}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero-body">{t.heroBody}</p>
          <Link className="primary-button" href={`/${locale}/category/new-arrivals`}>
            {t.shopNow}<Arrow />
          </Link>
        </div>
        <div className="hero-visual">
          <Image
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1400&q=90"
            alt={locale === "ar" ? "تشكيلة هدايا فاخرة من Xvond Store" : "Xvond Store luxury gift selection"}
            fill priority sizes="(max-width: 800px) 100vw, 50vw"
          />
          <div className="hero-visual-label"><span>XVOND</span> SELECTED</div>
        </div>
      </section>

      <section className="category-strip shell" aria-label={locale === "ar" ? "أقسام المتجر" : "Store categories"}>
        {categories.map((category) => (
          <Link href={`/${locale}/category/${category.slug}`} key={category.slug} className="category-card">
            <span>{category.symbol}</span>
            <strong>{category.label[locale]}</strong>
          </Link>
        ))}
      </section>

      <section className="products-section shell">
        <div className="section-heading"><div><p>XVOND EDIT</p><h2>{t.newArrivals}</h2></div><Link href={`/${locale}/category/new-arrivals`}>{t.discover}<Arrow /></Link></div>
        <div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div>
      </section>

      <section className="box-feature shell">
        <div className="box-art"><span className="box-logo">X</span><span className="ribbon" /></div>
        <div className="feature-copy">
          <p className="eyebrow">XVOND BOX</p>
          <h2>{t.boxTitle}</h2>
          <p>{t.boxBody}</p>
          <Link className="secondary-button" href={`/${locale}/category/xvond-box`}>{t.discover}<Arrow /></Link>
        </div>
      </section>

      <section className="products-section shell">
        <div className="section-heading"><div><p>FAVOURITES</p><h2>{t.bestSellers}</h2></div></div>
        <div className="product-grid">{products.slice(2, 6).map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div>
      </section>

      <section className="luxury-feature shell">
        <Image src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1400&q=88" alt={t.luxuryTitle} fill sizes="100vw" />
        <div className="luxury-overlay"><p>XVOND GIFTING</p><h2>{t.luxuryTitle}</h2><span>{t.luxuryBody}</span><Link href={`/${locale}/category/luxury-gifts`}>{t.discover}<Arrow /></Link></div>
      </section>

      <section className="trust-row shell">
        <div><TruckIcon /><span><strong>{t.delivery}</strong><small>{locale === "ar" ? "خيارات مرنة عند الإطلاق" : "Flexible options at launch"}</small></span></div>
        <div><CheckBadgeIcon /><span><strong>{t.secure}</strong><small>{locale === "ar" ? "حماية لبيانات الطلب" : "Order data protected"}</small></span></div>
        <div><LifebuoyIcon /><span><strong>{t.support}</strong><small>{locale === "ar" ? "قبل وبعد الشراء" : "Before and after purchase"}</small></span></div>
      </section>
    </main>
  );
}

