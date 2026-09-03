import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BoltIcon,
  GiftIcon,
  ShoppingBagIcon,
  SparklesIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { getCategories } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";
import styles from "./shop.module.css";

const icons = {
  women: ShoppingBagIcon,
  kids: SparklesIcon,
  electronics: BoltIcon,
  "xvond-box": GiftIcon,
  "luxury-gifts": GiftIcon,
  automotive: WrenchScrewdriverIcon,
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ar = locale === "ar";
  return {
    title: ar ? "تسوّق الأقسام | Xvond Store" : "Shop Departments | Xvond Store",
    description: ar ? "استكشف أقسام Xvond Store: نساء، أطفال، إلكترونيات، Xvond Box، هدايا، والسيارات ومستلزماتها." : "Explore Xvond Store departments: Women, Kids, Electronics, Xvond Box, Gifts and Automotive.",
    alternates: { canonical: absoluteUrl(`/${locale}/shop`) },
  };
}

export default async function ShopPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const categories = await getCategories();
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeftIcon : ArrowRightIcon;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <p>XVOND MARKETPLACE</p>
          <h1>{ar ? "شو بدك تتسوّق اليوم؟" : "What are you shopping for today?"}</h1>
          <span>{ar ? "اختار القسم، وبعدها صفّي المنتجات حسب السعر والتوفر والأحدث." : "Choose a department, then filter products by price, availability and newest arrivals."}</span>
        </div>
        <Link href={`/${locale}/category/new-arrivals`} className={styles.newLink}>
          {ar ? "وصل حديثًا" : "New arrivals"}<Arrow />
        </Link>
      </section>

      <section className={styles.departmentGrid} aria-label={ar ? "أقسام Xvond Store" : "Xvond Store departments"}>
        {categories.map((category, index) => {
          const Icon = icons[category.slug as keyof typeof icons] ?? ShoppingBagIcon;
          return (
            <Link href={`/${locale}/category/${category.slug}`} className={styles.departmentCard} key={category.slug}>
              <div className={styles.cardTop}>
                <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                <Icon />
              </div>
              <div className={styles.cardCopy}>
                <h2>{category.label[locale]}</h2>
                <p>{category.description[locale]}</p>
              </div>
              <span className={styles.explore}>{ar ? "تسوّق القسم" : "Shop department"}<Arrow /></span>
            </Link>
          );
        })}
      </section>

      <section className={styles.marketBar}>
        <div><TruckIcon /><span><strong>{ar ? "توصيل داخل عُمان" : "Delivery across Oman"}</strong><small>{ar ? "يُحسب حسب المنطقة عند الطلب" : "Calculated by area at checkout"}</small></span></div>
        <div><GiftIcon /><span><strong>{ar ? "خيارات للهدايا" : "Gift-ready picks"}</strong><small>{ar ? "هدايا وXvond Box ضمن متجر واحد" : "Gifts and Xvond Box in one store"}</small></span></div>
        <div><BoltIcon /><span><strong>{ar ? "تسوّق سريع وواضح" : "Fast, clear shopping"}</strong><small>{ar ? "بحث، تصفية، مفضلة وسلة" : "Search, filters, wishlist and cart"}</small></span></div>
      </section>
    </main>
  );
}
