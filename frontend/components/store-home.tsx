import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckBadgeIcon, LifebuoyIcon, TruckIcon } from "@heroicons/react/24/outline";
import type { Category, Product } from "@/lib/catalog";
import { copy, type Locale } from "@/lib/i18n";
import { ProductCard } from "./product-card";

export function StoreHome({ locale, categories, products }: { locale: Locale; categories: Category[]; products: Product[] }) {
  const t = copy[locale];
  const Arrow = locale === "ar" ? ArrowLeftIcon : ArrowRightIcon;
  const assetPath = process.env.NEXT_PUBLIC_BASE_PATH || "";

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
            src={`${assetPath}/hero-abstract.svg`}
            alt={locale === "ar" ? "تشكيلة هدايا فاخرة من Xvond Store" : "Xvond Store luxury gift selection"}
            fill priority sizes="(max-width: 800px) 100vw, 50vw"
          />
          <div className="hero-visual-label"><span>XVOND</span> SELECTED</div>
        </div>
      </section>

      <section className="category-strip shell" aria-label={locale === "ar" ? "أقسام المتجر" : "Store categories"}>
        {categories.map((category) => (
          <Link href={`/${locale}/category/${category.slug}`} key={category.slug} className="category-card">
            <span>{category.slug === "xvond-box" ? "X" : category.label.en.charAt(0)}</span>
            <strong>{category.label[locale]}</strong>
          </Link>
        ))}
      </section>

      <section className="products-section shell">
        <div className="section-heading"><div><p>XVOND EDIT</p><h2>{t.newArrivals}</h2></div><Link href={`/${locale}/category/new-arrivals`}>{t.discover}<Arrow /></Link></div>
        {products.length ? <div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div> : <CatalogEmpty locale={locale} />}
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
        {products.length ? <div className="product-grid">{products.slice(0, 4).reverse().map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div> : <CatalogEmpty locale={locale} />}
      </section>

      <section className="luxury-feature shell">
        <Image src={`${assetPath}/gift-abstract.svg`} alt={t.luxuryTitle} fill sizes="100vw" />
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

function CatalogEmpty({ locale }: { locale: Locale }) {
  return <div className="empty-card"><p>{locale === "ar" ? "المنتجات قيد التجهيز وستظهر هنا فور إضافتها من لوحة الإدارة." : "Products are being prepared and will appear here as soon as they are added in admin."}</p></div>;
}
