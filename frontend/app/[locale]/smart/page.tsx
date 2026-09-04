import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, BoltIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { SMART_CATEGORY_SLUGS } from "@/lib/store-context";
import { absoluteUrl } from "@/lib/urls";
import styles from "../store-channel.module.css";

const icons = { electronics: BoltIcon } as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ar = locale === "ar";
  return { title: "Xvond Smart Store | Xvond Store", description: ar ? "تسوّق Xvond Smart للمنتجات التقنية الذكية." : "Shop Xvond Smart for smart technology products.", alternates: { canonical: absoluteUrl(`/${locale}/smart`) } };
}

export default async function SmartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeftIcon : ArrowRightIcon;
  const [categories, products] = await Promise.all([getCategories(), getProducts({ sort: "newest", limit: 100 })]);
  const smart = SMART_CATEGORY_SLUGS.map((slug) => categories.find((category) => category.slug === slug)).filter(Boolean);
  const smartProducts = products.filter((product) => SMART_CATEGORY_SLUGS.includes(product.category as (typeof SMART_CATEGORY_SLUGS)[number]));

  return (
    <main className={`${styles.page} ${styles.smartPage}`}>
      <section className={styles.storeIntro}>
        <div>
          <span className={styles.xvondMark}>Xvond</span>
          <h1>Smart</h1>
        </div>
        <Link href={`/${locale}/lifestyle`} className={styles.storeSwitch}>Lifestyle Store<Arrow /></Link>
      </section>

      <section className={styles.categoryRail} aria-label={ar ? "أقسام Smart" : "Smart categories"}>
        {smart.map((category) => {
          if (!category) return null;
          const categoryProduct = smartProducts.find((product) => product.category === category.slug);
          const Icon = icons[category.slug as keyof typeof icons] ?? BoltIcon;
          const title = category.slug === "electronics" ? "Smart Tech" : category.label[locale];
          return (
            <Link key={category.slug} href={`/${locale}/category/${category.slug}`} className={styles.categoryTile}>
              <span className={styles.categoryVisual}>
                {categoryProduct ? (
                  <Image src={categoryProduct.image} alt="" fill sizes="(max-width: 700px) 28vw, 170px" className={styles.categoryImage} />
                ) : (
                  <Icon className={styles.categoryIcon} />
                )}
              </span>
              <strong>{title}</strong>
            </Link>
          );
        })}
      </section>

      <section className={styles.productsSection}>
        <div className={styles.productsHeading}>
          <h2>Smart</h2>
          <span>{smartProducts.length}</span>
        </div>
        {smartProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {smartProducts.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}
          </div>
        ) : (
          <p className={styles.emptyState}>{ar ? "لا توجد منتجات منشورة حاليًا." : "No published products yet."}</p>
        )}
      </section>
    </main>
  );
}
