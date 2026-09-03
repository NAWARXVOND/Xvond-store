import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, BoltIcon, GiftIcon } from "@heroicons/react/24/outline";
import { getCategories } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";
import styles from "../store-channel.module.css";

const smartSlugs = ["electronics", "xvond-box"] as const;
const icons = { electronics: BoltIcon, "xvond-box": GiftIcon } as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ar = locale === "ar";
  return { title: "Xvond Smart Store | Xvond Store", description: ar ? "تسوّق Xvond Smart للمنتجات التقنية وXvond Box." : "Shop Xvond Smart for technology products and Xvond Box.", alternates: { canonical: absoluteUrl(`/${locale}/smart`) } };
}

export default async function SmartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeftIcon : ArrowRightIcon;
  const categories = await getCategories();
  const smart = smartSlugs.map((slug) => categories.find((category) => category.slug === slug)).filter(Boolean);

  return (
    <main className={styles.page}>
      <section className={`${styles.storeHero} ${styles.smartHero}`}>
        <div className={styles.heroBrand}>
          <span>Xvond</span>
          <h1>Smart</h1>
          <strong>Store</strong>
        </div>
        <div className={styles.heroActions}>
          <Link href={`/${locale}/category/new-arrivals`} className={styles.primaryAction}>{ar ? "وصل حديثًا" : "New arrivals"}<Arrow /></Link>
          <Link href={`/${locale}/lifestyle`} className={styles.switchAction}>Lifestyle Store<Arrow /></Link>
        </div>
      </section>

      <section className={styles.collectionSection}>
        <div className={styles.sectionTitle}>
          <span>SHOP SMART</span>
          <h2>{ar ? "الأقسام" : "Collections"}</h2>
        </div>
        <div className={`${styles.collectionGrid} ${styles.smartGrid}`}>
          {smart.map((category, index) => {
            if (!category) return null;
            const Icon = icons[category.slug as keyof typeof icons] ?? BoltIcon;
            const title = category.slug === "electronics" ? "Smart Tech" : category.label[locale];
            return (
              <Link key={category.slug} href={`/${locale}/category/${category.slug}`} className={`${styles.collectionCard} ${styles.smartCard}`}>
                <div className={styles.collectionTop}><span>{String(index + 1).padStart(2, "0")}</span><Icon /></div>
                <div className={styles.collectionBottom}>
                  <h3>{title}</h3>
                  <span className={styles.enterCollection}>{ar ? "استكشف" : "Explore"}<Arrow /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.signatureBand}>
        <span>XVOND SMART</span>
        <strong>{ar ? "تقنية. أدوات. منتجات Xvond." : "Tech. Tools. Xvond products."}</strong>
      </section>
    </main>
  );
}
