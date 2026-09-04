import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, GiftIcon, ShoppingBagIcon, SparklesIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { LIFESTYLE_CATEGORY_SLUGS } from "@/lib/store-context";
import { absoluteUrl } from "@/lib/urls";
import styles from "../store-channel.module.css";

const icons = { women: ShoppingBagIcon, kids: SparklesIcon, "luxury-gifts": GiftIcon, automotive: WrenchScrewdriverIcon, "xvond-box": GiftIcon } as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ar = locale === "ar";
  return { title: "Xvond Lifestyle Store | Xvond Store", description: ar ? "تسوّق Xvond Lifestyle: نساء، أطفال، هدايا، مستلزمات السيارة وXvond Box." : "Shop Xvond Lifestyle across women, kids, gifts, automotive and Xvond Box.", alternates: { canonical: absoluteUrl(`/${locale}/lifestyle`) } };
}

export default async function LifestylePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeftIcon : ArrowRightIcon;
  const [categories, products] = await Promise.all([getCategories(), getProducts({ sort: "newest", limit: 100 })]);
  const lifestyle = LIFESTYLE_CATEGORY_SLUGS.map((slug) => categories.find((category) => category.slug === slug)).filter(Boolean);
  const lifestyleProducts = products.filter((product) => LIFESTYLE_CATEGORY_SLUGS.includes(product.category as (typeof LIFESTYLE_CATEGORY_SLUGS)[number]));

  return (
    <main className={`${styles.page} ${styles.lifestylePage}`}>
      <section className={styles.storeIntro}>
        <div>
          <span className={styles.xvondMark}>Xvond</span>
          <h1>Lifestyle</h1>
        </div>
        <Link href={`/${locale}/smart`} className={styles.storeSwitch}>Smart Store<Arrow /></Link>
      </section>

      <section className={styles.categoryRail} aria-label={ar ? "أقسام Lifestyle" : "Lifestyle categories"}>
        {lifestyle.map((category) => {
          if (!category) return null;
          const categoryProduct = lifestyleProducts.find((product) => product.category === category.slug);
          const Icon = icons[category.slug as keyof typeof icons] ?? ShoppingBagIcon;
          return (
            <Link key={category.slug} href={`/${locale}/category/${category.slug}`} className={styles.categoryTile}>
              <span className={styles.categoryVisual}>
                {categoryProduct ? (
                  <Image src={categoryProduct.image} alt="" fill sizes="(max-width: 700px) 28vw, 170px" className={styles.categoryImage} />
                ) : (
                  <Icon className={styles.categoryIcon} />
                )}
              </span>
              <strong>{category.label[locale]}</strong>
            </Link>
          );
        })}
      </section>

      <section className={styles.productsSection}>
        <div className={styles.productsHeading}>
          <h2>Lifestyle</h2>
          <span>{lifestyleProducts.length}</span>
        </div>
        {lifestyleProducts.length > 0 ? (
          <div className={styles.productsGrid}>
            {lifestyleProducts.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}
          </div>
        ) : (
          <p className={styles.emptyState}>{ar ? "لا توجد منتجات منشورة حاليًا." : "No published products yet."}</p>
        )}
      </section>
    </main>
  );
}
