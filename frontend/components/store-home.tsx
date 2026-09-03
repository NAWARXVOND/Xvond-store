import Image from "next/image";
import Link from "next/link";
import { ArrowLeftIcon, ArrowRightIcon, CheckBadgeIcon, CpuChipIcon, LifebuoyIcon, SparklesIcon, TruckIcon } from "@heroicons/react/24/outline";
import type { Category, Product } from "@/lib/catalog";
import { copy, type Locale } from "@/lib/i18n";
import { ProductCard } from "./product-card";

const lifestyleDepartments = [
  { slug: "women", ar: "نساء", en: "Women", mark: "W", kickerAr: "أناقة واختيارات يومية", kickerEn: "Style and everyday picks" },
  { slug: "kids", ar: "أطفال", en: "Kids", mark: "K", kickerAr: "اختيارات عملية للصغار", kickerEn: "Practical picks for kids" },
  { slug: "luxury-gifts", ar: "هدايا", en: "Gifts", mark: "G", kickerAr: "هدايا لمناسبات مختلفة", kickerEn: "Gifts for every occasion" },
  { slug: "automotive", ar: "سيارات", en: "Automotive", mark: "A", kickerAr: "مستلزمات مختارة للسيارة", kickerEn: "Selected car essentials" },
] as const;

const smartDepartments = [
  { slug: "electronics", ar: "إلكترونيات ذكية", en: "Smart Tech", mark: "S", kickerAr: "تقنية مفيدة للحياة اليومية", kickerEn: "Useful technology for everyday life" },
  { slug: "xvond-box", ar: "Xvond Box", en: "Xvond Box", mark: "X", kickerAr: "بوكسات وتجارب Xvond المميزة", kickerEn: "Signature Xvond boxes and experiences" },
] as const;

export function StoreHome({ locale, categories, products }: { locale: Locale; categories: Category[]; products: Product[] }) {
  const t = copy[locale];
  const Arrow = locale === "ar" ? ArrowLeftIcon : ArrowRightIcon;
  const assetPath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const ar = locale === "ar";
  const resolve = <T extends { slug: string; ar: string; en: string; kickerAr: string; kickerEn: string }>(item: T) => {
    const live = categories.find((category) => category.slug === item.slug);
    return { ...item, label: live?.label[locale] || (ar ? item.ar : item.en), kicker: ar ? item.kickerAr : item.kickerEn };
  };
  const lifestyle = lifestyleDepartments.map(resolve);
  const smart = smartDepartments.map(resolve);
  const newArrivals = products.slice(0, 4);
  const moreToExplore = products.slice(4, 8);

  return (
    <main className="curated-home">
      <section className="curated-hero shell">
        <div className="curated-hero-copy">
          <p className="eyebrow">XVOND STORE</p>
          <h1>{ar ? "متجر واحد. عالمين مختلفين." : "One store. Two distinct worlds."}</h1>
          <p>{ar ? "Xvond Store مقسوم بوضوح بين Lifestyle للمنتجات اليومية المختارة، وSmart للتقنية والمنتجات التي تعكس هوية Xvond المستقبلية." : "Xvond Store is clearly divided into Lifestyle for curated everyday products and Smart for technology and products that reflect Xvond's future-facing identity."}</p>
          <div className="curated-hero-actions">
            <Link className="primary-button" href={`/${locale}/lifestyle`}>Xvond Lifestyle Store<Arrow /></Link>
            <Link className="curated-text-link" href={`/${locale}/smart`}>Xvond Smart Store<Arrow /></Link>
          </div>
        </div>
        <div className="curated-hero-art">
          <Image src={`${assetPath}/hero-abstract.svg`} alt="Xvond Store" fill priority sizes="(max-width: 900px) 100vw, 55vw" />
          <div className="curated-hero-stamp"><span>XVOND</span><b>LIFESTYLE + SMART</b></div>
        </div>
      </section>

      <section className="store-paths shell">
        <Link href={`/${locale}/lifestyle`} className="store-path-card lifestyle-path">
          <div className="store-path-icon"><SparklesIcon /></div>
          <p>XVOND LIFESTYLE STORE</p>
          <h2>{ar ? "منتجات للحياة اليومية، لكن باختيار أذكى." : "Everyday products, selected with more intention."}</h2>
          <span>{ar ? "نساء، أطفال، هدايا، سيارة واختيارات لايف ستايل نختارها بعناية بدل متجر عام عشوائي." : "Women, kids, gifts, automotive and lifestyle products curated instead of a random general store."}</span>
          <b>{ar ? "ادخل Lifestyle Store" : "Enter Lifestyle Store"}<Arrow /></b>
        </Link>
        <Link href={`/${locale}/smart`} className="store-path-card smart-path">
          <div className="store-path-icon"><CpuChipIcon /></div>
          <p>XVOND SMART STORE</p>
          <h2>{ar ? "تقنية، Smart Products، ومستقبل Xvond AI." : "Technology, smart products and the future of Xvond AI."}</h2>
          <span>{ar ? "المسار اللي بيكبر مع Xvond: إلكترونيات ذكية، أدوات عمل وCreator، Smart Home، AI Devices وXvond Box." : "The side that grows with Xvond: smart tech, work and creator tools, Smart Home, AI devices and Xvond Box."}</span>
          <b>{ar ? "ادخل Smart Store" : "Enter Smart Store"}<Arrow /></b>
        </Link>
      </section>

      <section className="curated-collections shell">
        <div className="curated-section-heading"><div><p>LIFESTYLE COLLECTIONS</p><h2>Xvond Lifestyle Store</h2></div><Link href={`/${locale}/lifestyle`}>{ar ? "استكشف المتجر" : "Explore store"}<Arrow /></Link></div>
        <div className="curated-collection-grid lifestyle-collection-grid">
          {lifestyle.map((item, index) => <Link href={`/${locale}/category/${item.slug}`} key={item.slug} className={`curated-collection-card curated-collection-${index + 1}`}><span className="curated-collection-mark">{item.mark}</span><div><small>{item.kicker}</small><strong>{item.label}</strong><b>{ar ? "استكشف" : "Explore"}<Arrow /></b></div></Link>)}
        </div>
      </section>

      <section className="curated-collections shell smart-collections-section">
        <div className="curated-section-heading"><div><p>SMART COLLECTIONS</p><h2>Xvond Smart Store</h2><span>{ar ? "نبدأ بتشكيلة صغيرة، ونوسعها تدريجيًا مع منتجات Smart وAI حقيقية." : "Starting focused, then expanding gradually with real smart and AI products."}</span></div><Link href={`/${locale}/smart`}>{ar ? "استكشف المتجر" : "Explore store"}<Arrow /></Link></div>
        <div className="smart-mini-grid">
          {smart.map((item) => <Link href={`/${locale}/category/${item.slug}`} key={item.slug} className="smart-mini-card"><span>{item.mark}</span><div><small>{item.kicker}</small><strong>{item.label}</strong><b>{ar ? "استكشف" : "Explore"}<Arrow /></b></div></Link>)}
        </div>
      </section>

      <section className="curated-products shell">
        <div className="curated-section-heading"><div><p>NEW IN</p><h2>{t.newArrivals}</h2></div><Link href={`/${locale}/category/new-arrivals`}>{t.discover}<Arrow /></Link></div>
        {newArrivals.length ? <div className="curated-product-grid">{newArrivals.map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div> : <CatalogEmpty locale={locale} />}
      </section>

      <section className="curated-signature shell">
        <Link href={`/${locale}/category/xvond-box`} className="curated-signature-box"><div><p>XVOND BOX</p><h2>{t.boxTitle}</h2><span>{t.boxBody}</span><b>{t.discover}<Arrow /></b></div><span className="curated-signature-x">X</span></Link>
        <Link href={`/${locale}/category/luxury-gifts`} className="curated-signature-gift"><Image src={`${assetPath}/gift-abstract.svg`} alt={t.luxuryTitle} fill sizes="(max-width: 800px) 100vw, 50vw" /><div><p>XVOND GIFTING</p><h2>{t.luxuryTitle}</h2><span>{t.luxuryBody}</span><b>{t.discover}<Arrow /></b></div></Link>
      </section>

      {moreToExplore.length > 0 && <section className="curated-products shell curated-products-secondary"><div className="curated-section-heading"><div><p>DISCOVER MORE</p><h2>{ar ? "المزيد من Xvond Store" : "More from Xvond Store"}</h2></div><Link href={`/${locale}/shop`}>{ar ? "كل المنتجات" : "View all products"}<Arrow /></Link></div><div className="curated-product-grid">{moreToExplore.map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div></section>}

      <section className="curated-story shell">
        <div><p>ONE BRAND, TWO STORES</p><h2>{ar ? "مرونة للبيع العام بدون ما نضيّع هوية Xvond" : "Commercial flexibility without losing Xvond's identity"}</h2><span>{ar ? "Lifestyle يعطينا مساحة نبيع منتجات متنوعة ومطلوبة، وSmart يبني الخط التقني والـAI الخاص بالبراند. الاثنين تحت تجربة واحدة وحساب واحد وسلة واحدة." : "Lifestyle gives us room to sell varied, commercial products, while Smart builds the technology and AI side of the brand. Both live under one experience, one account and one cart."}</span></div>
        <div className="curated-story-points"><div><SparklesIcon /><strong>Xvond Lifestyle</strong><span>{ar ? "اختيارات يومية متعددة." : "Curated everyday variety."}</span></div><div><CpuChipIcon /><strong>Xvond Smart</strong><span>{ar ? "Smart Tech وAI." : "Smart tech and AI."}</span></div><div><TruckIcon /><strong>{t.delivery}</strong><span>{ar ? "توصيل واضح عند الطلب." : "Clear delivery at checkout."}</span></div><div><CheckBadgeIcon /><strong>{t.secure}</strong><span>{ar ? "تجربة شراء موحدة وآمنة." : "One secure buying experience."}</span></div><div><LifebuoyIcon /><strong>{t.support}</strong><span>{ar ? "دعم للمتجرين." : "Support across both stores."}</span></div></div>
      </section>
    </main>
  );
}

function CatalogEmpty({ locale }: { locale: Locale }) {
  return <div className="empty-card"><p>{locale === "ar" ? "المنتجات ستظهر هنا فور إضافتها من لوحة الإدارة." : "Products will appear here as soon as they are added from admin."}</p></div>;
}
