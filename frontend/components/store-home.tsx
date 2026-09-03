import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckBadgeIcon, LifebuoyIcon, SparklesIcon, TruckIcon } from "@heroicons/react/24/outline";
import type { Category, Product } from "@/lib/catalog";
import { copy, type Locale } from "@/lib/i18n";
import { ProductCard } from "./product-card";

const fallbackDepartments = [
  { slug: "women", ar: "نساء", en: "Women", mark: "W" },
  { slug: "kids", ar: "أطفال", en: "Kids", mark: "K" },
  { slug: "electronics", ar: "إلكترونيات", en: "Electronics", mark: "E" },
  { slug: "xvond-box", ar: "Xvond Box", en: "Xvond Box", mark: "X" },
  { slug: "luxury-gifts", ar: "هدايا", en: "Gifts", mark: "G" },
  { slug: "automotive", ar: "سيارات ومستلزماتها", en: "Automotive", mark: "A" },
] as const;

export function StoreHome({ locale, categories, products }: { locale: Locale; categories: Category[]; products: Product[] }) {
  const t = copy[locale];
  const Arrow = locale === "ar" ? ArrowLeftIcon : ArrowRightIcon;
  const assetPath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const ar = locale === "ar";
  const departmentCards = fallbackDepartments.map((item) => {
    const live = categories.find((category) => category.slug === item.slug);
    return { ...item, label: live?.label[locale] || (ar ? item.ar : item.en) };
  });

  return (
    <main className="marketplace-home">
      <section className="marketplace-hero shell">
        <div className="marketplace-hero-main">
          <div className="hero-content premium-hero-copy">
            <p className="eyebrow">XVOND MARKETPLACE</p>
            <h1>{ar ? "كل ما تحبّه. مختار بطريقة أذكى." : "Everything you love. Curated smarter."}</h1>
            <p className="hero-body">{ar ? "تسوّق الأزياء، الإلكترونيات، الهدايا، Xvond Box ومستلزمات السيارات ضمن تجربة واحدة سريعة وواضحة." : "Shop fashion, electronics, gifts, Xvond Box and automotive essentials in one fast, clear experience."}</p>
            <div className="hero-cta-row">
              <Link className="primary-button" href={`/${locale}/shop`}>{t.shopNow}<Arrow /></Link>
              <Link className="secondary-button" href={`/${locale}/category/new-arrivals`}>{t.newArrivals}<Arrow /></Link>
            </div>
          </div>
          <div className="hero-visual marketplace-hero-visual">
            <Image src={`${assetPath}/hero-abstract.svg`} alt={ar ? "مختارات Xvond Store" : "Xvond Store selections"} fill priority sizes="(max-width: 900px) 100vw, 55vw" />
            <div className="hero-visual-label"><span>XVOND</span> SELECTED</div>
          </div>
        </div>
        <div className="hero-side-stack">
          <Link href={`/${locale}/category/xvond-box`} className="promo-tile promo-xvond-box"><span>XVOND BOX</span><strong>{ar ? "هدية مختلفة كل مرة" : "A different gift every time"}</strong><small>{ar ? "اكتشف الصناديق" : "Explore boxes"}</small></Link>
          <Link href={`/${locale}/category/new-arrivals`} className="promo-tile promo-new"><span>{ar ? "وصل حديثًا" : "NEW IN"}</span><strong>{ar ? "اختيارات جديدة باستمرار" : "Fresh picks, always"}</strong><small>{ar ? "تسوّق الجديد" : "Shop new"}</small></Link>
        </div>
      </section>

      <section className="marketplace-departments shell">
        <div className="marketplace-section-title"><div><p>SHOP BY DEPARTMENT</p><h2>{ar ? "تسوّق حسب القسم" : "Shop by department"}</h2></div><Link href={`/${locale}/shop`}>{ar ? "عرض الكل" : "View all"}<Arrow /></Link></div>
        <div className="department-card-grid">
          {departmentCards.map((item) => <Link href={`/${locale}/category/${item.slug}`} key={item.slug} className={`department-card department-${item.slug}`}><span>{item.mark}</span><strong>{item.label}</strong><small>{ar ? "اكتشف المنتجات" : "Explore products"}</small></Link>)}
        </div>
      </section>

      <section className="marketplace-products shell">
        <div className="marketplace-section-title"><div><p>NEW IN</p><h2>{t.newArrivals}</h2></div><Link href={`/${locale}/category/new-arrivals`}>{t.discover}<Arrow /></Link></div>
        {products.length ? <div className="product-grid marketplace-product-grid">{products.slice(0, 8).map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div> : <CatalogEmpty locale={locale} />}
      </section>

      <section className="deal-banner shell">
        <div><p>XVOND PICKS</p><h2>{ar ? "اختيارات تستحق مكانًا عندك" : "Picks worth bringing home"}</h2><span>{ar ? "منتجات نبرزها لأنها عملية، مميزة أو مناسبة للهدايا." : "Products highlighted for usefulness, distinction or gifting."}</span></div>
        <Link href={`/${locale}/shop`} className="primary-button">{ar ? "ابدأ التسوق" : "Start shopping"}<Arrow /></Link>
      </section>

      <section className="marketplace-products shell">
        <div className="marketplace-section-title"><div><p>BEST SELLERS</p><h2>{t.bestSellers}</h2></div><Link href={`/${locale}/shop`}>{ar ? "تسوّق المزيد" : "Shop more"}<Arrow /></Link></div>
        {products.length ? <div className="product-grid marketplace-product-grid">{products.slice(0, 8).reverse().map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div> : <CatalogEmpty locale={locale} />}
      </section>

      <section className="marketplace-feature-grid shell">
        <Link href={`/${locale}/category/xvond-box`} className="marketplace-feature xvond-box-feature"><div><p>XVOND BOX</p><h2>{t.boxTitle}</h2><span>{t.boxBody}</span><b>{t.discover}<Arrow /></b></div><span className="feature-x">X</span></Link>
        <Link href={`/${locale}/category/luxury-gifts`} className="marketplace-feature gifting-feature"><Image src={`${assetPath}/gift-abstract.svg`} alt={t.luxuryTitle} fill sizes="(max-width: 800px) 100vw, 50vw" /><div><p>XVOND GIFTING</p><h2>{t.luxuryTitle}</h2><span>{t.luxuryBody}</span><b>{t.discover}<Arrow /></b></div></Link>
      </section>

      <section className="why-xvond shell">
        <div className="marketplace-section-title"><div><p>WHY XVOND</p><h2>{ar ? "تجربة متجر مرتبة من أول نقرة" : "A cleaner shopping experience from the first click"}</h2></div></div>
        <div className="why-grid">
          <div><SparklesIcon /><strong>{ar ? "مختارات واضحة" : "Curated choices"}</strong><span>{ar ? "أقسام متنوعة بدون فوضى." : "Variety without the clutter."}</span></div>
          <div><TruckIcon /><strong>{t.delivery}</strong><span>{ar ? "خيارات توصيل تظهر بوضوح أثناء الطلب." : "Clear delivery options during checkout."}</span></div>
          <div><CheckBadgeIcon /><strong>{t.secure}</strong><span>{ar ? "حماية بيانات الطلب والدفع." : "Protection for order and payment data."}</span></div>
          <div><LifebuoyIcon /><strong>{t.support}</strong><span>{ar ? "دعم قبل وبعد الشراء." : "Support before and after purchase."}</span></div>
        </div>
      </section>
    </main>
  );
}

function CatalogEmpty({ locale }: { locale: Locale }) {
  return <div className="empty-card"><p>{locale === "ar" ? "المنتجات ستظهر هنا فور إضافتها من لوحة الإدارة." : "Products will appear here as soon as they are added from admin."}</p></div>;
}
