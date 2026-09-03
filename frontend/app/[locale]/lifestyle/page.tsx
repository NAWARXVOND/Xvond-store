import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, GiftIcon, ShoppingBagIcon, SparklesIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { getCategories } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { LIFESTYLE_CATEGORY_SLUGS, storeNewArrivalsPath } from "@/lib/store-context";
import { absoluteUrl } from "@/lib/urls";
import styles from "../store-channel.module.css";

const icons = { women: ShoppingBagIcon, kids: SparklesIcon, "luxury-gifts": GiftIcon, automotive: WrenchScrewdriverIcon } as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ar = locale === "ar";
  return { title: "Xvond Lifestyle Store | Xvond Store", description: ar ? "تسوّق Xvond Lifestyle: نساء، أطفال، هدايا ومستلزمات السيارة." : "Shop Xvond Lifestyle across women, kids, gifts and automotive.", alternates: { canonical: absoluteUrl(`/${locale}/lifestyle`) } };
}

export default async function LifestylePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeftIcon : ArrowRightIcon;
  const categories = await getCategories();
  const lifestyle = LIFESTYLE_CATEGORY_SLUGS.map((slug) => categories.find((category) => category.slug === slug)).filter(Boolean);

  return (
    <main className={styles.page}>
      <section className={`${styles.storeHero} ${styles.lifestyleHero}`}>
        <div className={styles.heroBrand}>
          <span>Xvond</span>
          <h1>Lifestyle</h1>
          <strong>Store</strong>
        </div>
        <div className={styles.heroActions}>
          <Link href={storeNewArrivalsPath(locale, "lifestyle")} className={styles.primaryAction}>{ar ? "وصل حديثًا" : "New arrivals"}<Arrow /></Link>
          <Link href={`/${locale}/smart`} className={styles.switchAction}>Smart Store<Arrow /></Link>
        </div>
      </section>

      <section className={styles.collectionSection}>
        <div className={styles.sectionTitle}>
          <span>SHOP LIFESTYLE</span>
          <h2>{ar ? "الأقسام" : "Collections"}</h2>
        </div>
        <div className={styles.collectionGrid}>
          {lifestyle.map((category, index) => {
            if (!category) return null;
            const Icon = icons[category.slug as keyof typeof icons] ?? ShoppingBagIcon;
            return (
              <Link key={category.slug} href={`/${locale}/category/${category.slug}`} className={`${styles.collectionCard} ${styles.lifestyleCard}`}>
                <div className={styles.collectionTop}><span>{String(index + 1).padStart(2, "0")}</span><Icon /></div>
                <div className={styles.collectionBottom}>
                  <h3>{category.label[locale]}</h3>
                  <span className={styles.enterCollection}>{ar ? "تسوّق" : "Shop"}<Arrow /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
