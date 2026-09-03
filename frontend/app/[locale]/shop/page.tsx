import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, BoltIcon, GiftIcon, ShoppingBagIcon, SparklesIcon, TruckIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { getCategories } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";
import styles from "./shop.module.css";

const icons = { women: ShoppingBagIcon, kids: SparklesIcon, electronics: BoltIcon, "xvond-box": GiftIcon, "luxury-gifts": GiftIcon, automotive: WrenchScrewdriverIcon } as const;
const lifestyle = new Set(["women", "kids", "luxury-gifts", "automotive"]);
const smart = new Set(["electronics", "xvond-box"]);

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ar = locale === "ar";
  return { title: ar ? "Xvond Lifestyle Store + Xvond Smart Store" : "Xvond Lifestyle Store + Xvond Smart Store", description: ar ? "استكشف Xvond Store عبر مسارين واضحين: Lifestyle للمنتجات اليومية المختارة وSmart للتقنية والمنتجات الذكية." : "Explore Xvond Store through two clear paths: Lifestyle for curated everyday products and Smart for technology and smart products.", alternates: { canonical: absoluteUrl(`/${locale}/shop`) } };
}

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const categories = await getCategories();
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeftIcon : ArrowRightIcon;
  const lifestyleCategories = categories.filter((category) => lifestyle.has(category.slug));
  const smartCategories = categories.filter((category) => smart.has(category.slug));

  const renderCards = (items: typeof categories, offset = 0) => items.map((category, index) => {
    const Icon = icons[category.slug as keyof typeof icons] ?? ShoppingBagIcon;
    return <Link href={`/${locale}/category/${category.slug}`} className={styles.departmentCard} key={category.slug}><div className={styles.cardTop}><span className={styles.number}>{String(index + 1 + offset).padStart(2, "0")}</span><Icon /></div><div className={styles.cardCopy}><h2>{category.label[locale]}</h2><p>{category.description[locale]}</p></div><span className={styles.explore}>{ar ? "تسوّق القسم" : "Shop department"}<Arrow /></span></Link>;
  });

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div><p>XVOND STORE</p><h1>{ar ? "اختار عالمك." : "Choose your side of Xvond."}</h1><span>{ar ? "Lifestyle للمنتجات اليومية المختارة. Smart للتقنية والمنتجات الذكية. الاثنين تحت نفس الحساب والسلة وتجربة الشراء." : "Lifestyle for curated everyday products. Smart for technology and intelligent products. Both share one account, cart and checkout."}</span></div>
        <Link href={`/${locale}/category/new-arrivals`} className={styles.newLink}>{ar ? "وصل حديثًا" : "New arrivals"}<Arrow /></Link>
      </section>

      <section className={styles.storeSplit}>
        <Link href={`/${locale}/lifestyle`} className={styles.storeChoice}><span>LIFESTYLE</span><h2>Xvond Lifestyle Store</h2><p>{ar ? "نساء، أطفال، هدايا، سيارة ومنتجات يومية مختارة." : "Women, kids, gifts, automotive and curated everyday products."}</p><b>{ar ? "ادخل المتجر" : "Enter store"}<Arrow /></b></Link>
        <Link href={`/${locale}/smart`} className={`${styles.storeChoice} ${styles.smartChoice}`}><span>SMART</span><h2>Xvond Smart Store</h2><p>{ar ? "Smart Tech، إلكترونيات، Xvond Box، ومستقبل Xvond AI." : "Smart tech, electronics, Xvond Box and the future of Xvond AI."}</p><b>{ar ? "ادخل المتجر" : "Enter store"}<Arrow /></b></Link>
      </section>

      {lifestyleCategories.length > 0 && <section className={styles.groupSection}><div className={styles.groupHead}><p>XVOND LIFESTYLE STORE</p><h2>{ar ? "Lifestyle Collections" : "Lifestyle Collections"}</h2></div><div className={styles.departmentGrid}>{renderCards(lifestyleCategories)}</div></section>}
      {smartCategories.length > 0 && <section className={styles.groupSection}><div className={styles.groupHead}><p>XVOND SMART STORE</p><h2>{ar ? "Smart Collections" : "Smart Collections"}</h2></div><div className={styles.departmentGrid}>{renderCards(smartCategories, lifestyleCategories.length)}</div></section>}

      <section className={styles.marketBar}>
        <div><TruckIcon /><span><strong>{ar ? "توصيل داخل عُمان" : "Delivery across Oman"}</strong><small>{ar ? "يُحسب حسب المنطقة عند الطلب" : "Calculated by area at checkout"}</small></span></div>
        <div><GiftIcon /><span><strong>Xvond Lifestyle + Smart</strong><small>{ar ? "متجرين بهوية واحدة" : "Two stores, one brand"}</small></span></div>
        <div><BoltIcon /><span><strong>{ar ? "تجربة شراء واحدة" : "One shopping experience"}</strong><small>{ar ? "بحث، مفضلة، حساب وسلة مشتركة" : "Shared search, wishlist, account and cart"}</small></span></div>
      </section>
    </main>
  );
}
