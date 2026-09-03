import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckBadgeIcon, LifebuoyIcon, SparklesIcon, TruckIcon } from "@heroicons/react/24/outline";
import type { Category, Product } from "@/lib/catalog";
import { copy, type Locale } from "@/lib/i18n";
import { ProductCard } from "./product-card";

const fallbackDepartments = [
  { slug: "women", ar: "نساء", en: "Women", mark: "W", kickerAr: "اختيارات يومية وأناقة سهلة", kickerEn: "Everyday style, edited down" },
  { slug: "kids", ar: "أطفال", en: "Kids", mark: "K", kickerAr: "اختيارات عملية للصغار", kickerEn: "Smart picks for little ones" },
  { slug: "electronics", ar: "إلكترونيات", en: "Electronics", mark: "E", kickerAr: "تقنية مختارة بدون تشتيت", kickerEn: "Useful tech, without the clutter" },
  { slug: "xvond-box", ar: "Xvond Box", en: "Xvond Box", mark: "X", kickerAr: "تجربة Xvond الخاصة", kickerEn: "A signature Xvond experience" },
  { slug: "luxury-gifts", ar: "هدايا", en: "Gifts", mark: "G", kickerAr: "هدايا مرتبة لمناسبات مختلفة", kickerEn: "Thoughtful gifts for every moment" },
  { slug: "automotive", ar: "سيارات ومستلزماتها", en: "Automotive", mark: "A", kickerAr: "إضافات مختارة للسيارة", kickerEn: "Selected essentials for the car" },
] as const;

export function StoreHome({ locale, categories, products }: { locale: Locale; categories: Category[]; products: Product[] }) {
  const t = copy[locale];
  const Arrow = locale === "ar" ? ArrowLeftIcon : ArrowRightIcon;
  const assetPath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const ar = locale === "ar";
  const departmentCards = fallbackDepartments.map((item) => {
    const live = categories.find((category) => category.slug === item.slug);
    return {
      ...item,
      label: live?.label[locale] || (ar ? item.ar : item.en),
      kicker: ar ? item.kickerAr : item.kickerEn,
    };
  });

  const newArrivals = products.slice(0, 4);
  const moreToExplore = products.slice(4, 8);

  return (
    <main className="curated-home">
      <section className="curated-hero shell">
        <div className="curated-hero-copy">
          <p className="eyebrow">XVOND STORE</p>
          <h1>{ar ? "أشياء أقل. اختيارات أفضل." : "Fewer things. Better choices."}</h1>
          <p>{ar ? "متجر Xvond مبني حول تشكيلة صغيرة ومدروسة، حتى يكون كل منتج له مكان واضح بدل آلاف الخيارات المتشابهة." : "Xvond Store is built around a focused, considered selection, so every product has a clear place instead of getting lost among thousands of similar options."}</p>
          <div className="curated-hero-actions">
            <Link className="primary-button" href={`/${locale}/shop`}>{t.shopNow}<Arrow /></Link>
            <Link className="curated-text-link" href={`/${locale}/category/new-arrivals`}>{t.newArrivals}<Arrow /></Link>
          </div>
        </div>
        <div className="curated-hero-art">
          <Image src={`${assetPath}/hero-abstract.svg`} alt={ar ? "مختارات Xvond Store" : "Xvond Store selection"} fill priority sizes="(max-width: 900px) 100vw, 55vw" />
          <div className="curated-hero-stamp"><span>XVOND</span><b>CURATED STORE</b></div>
        </div>
      </section>

      <section className="curated-collections shell">
        <div className="curated-section-heading">
          <div><p>COLLECTIONS</p><h2>{ar ? "ابدأ من الشي اللي يهمك" : "Start with what matters to you"}</h2></div>
          <Link href={`/${locale}/shop`}>{ar ? "كل الأقسام" : "All departments"}<Arrow /></Link>
        </div>
        <div className="curated-collection-grid">
          {departmentCards.map((item, index) => (
            <Link href={`/${locale}/category/${item.slug}`} key={item.slug} className={`curated-collection-card curated-collection-${index + 1}`}>
              <span className="curated-collection-mark">{item.mark}</span>
              <div><small>{item.kicker}</small><strong>{item.label}</strong><b>{ar ? "استكشف" : "Explore"}<Arrow /></b></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="curated-products shell">
        <div className="curated-section-heading">
          <div><p>NEW IN</p><h2>{t.newArrivals}</h2><span>{ar ? "أحدث المنتجات المضافة للمتجر، بدون تكرار نفس القطع في كل مكان." : "The newest additions to the store, without repeating the same items everywhere."}</span></div>
          <Link href={`/${locale}/category/new-arrivals`}>{t.discover}<Arrow /></Link>
        </div>
        {newArrivals.length ? <div className="curated-product-grid">{newArrivals.map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div> : <CatalogEmpty locale={locale} />}
      </section>

      <section className="curated-signature shell">
        <Link href={`/${locale}/category/xvond-box`} className="curated-signature-box">
          <div><p>XVOND BOX</p><h2>{t.boxTitle}</h2><span>{t.boxBody}</span><b>{t.discover}<Arrow /></b></div>
          <span className="curated-signature-x">X</span>
        </Link>
        <Link href={`/${locale}/category/luxury-gifts`} className="curated-signature-gift">
          <Image src={`${assetPath}/gift-abstract.svg`} alt={t.luxuryTitle} fill sizes="(max-width: 800px) 100vw, 50vw" />
          <div><p>XVOND GIFTING</p><h2>{t.luxuryTitle}</h2><span>{t.luxuryBody}</span><b>{t.discover}<Arrow /></b></div>
        </Link>
      </section>

      {moreToExplore.length > 0 && (
        <section className="curated-products shell curated-products-secondary">
          <div className="curated-section-heading">
            <div><p>DISCOVER MORE</p><h2>{ar ? "كمّل اكتشاف التشكيلة" : "Explore more of the collection"}</h2></div>
            <Link href={`/${locale}/shop`}>{ar ? "عرض كل المنتجات" : "View all products"}<Arrow /></Link>
          </div>
          <div className="curated-product-grid">{moreToExplore.map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div>
        </section>
      )}

      <section className="curated-story shell">
        <div>
          <p>WHY XVOND</p>
          <h2>{ar ? "متجر صغير بالتشكيلة، كبير بالتجربة" : "A focused catalog with a bigger shopping experience"}</h2>
          <span>{ar ? "الفكرة مو نعبّي الموقع بمنتجات كثيرة. الفكرة نرتّب عدد محدود من المنتجات بطريقة تخليك تلاقي المناسب بسرعة، وتفهم كل قسم من أول نظرة." : "The goal is not to fill the site with endless products. It is to organize a focused catalog so the right item is easier to find and every department makes sense at a glance."}</span>
        </div>
        <div className="curated-story-points">
          <div><SparklesIcon /><strong>{ar ? "تشكيلة مدروسة" : "Focused selection"}</strong><span>{ar ? "كل منتج له مكان واضح." : "Every item has a clear place."}</span></div>
          <div><TruckIcon /><strong>{t.delivery}</strong><span>{ar ? "خيارات التوصيل تظهر بوضوح أثناء الطلب." : "Delivery options stay clear at checkout."}</span></div>
          <div><CheckBadgeIcon /><strong>{t.secure}</strong><span>{ar ? "حماية بيانات الطلب والدفع." : "Order and payment data protected."}</span></div>
          <div><LifebuoyIcon /><strong>{t.support}</strong><span>{ar ? "دعم قبل وبعد الشراء." : "Support before and after purchase."}</span></div>
        </div>
      </section>
    </main>
  );
}

function CatalogEmpty({ locale }: { locale: Locale }) {
  return <div className="empty-card"><p>{locale === "ar" ? "المنتجات ستظهر هنا فور إضافتها من لوحة الإدارة." : "Products will appear here as soon as they are added from admin."}</p></div>;
}
