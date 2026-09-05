import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoltIcon, SparklesIcon, PuzzlePieceIcon, TruckIcon, GiftIcon, CubeIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";
import styles from "./store-channel.module.css";

const icons = { electronics: BoltIcon, women: SparklesIcon, kids: PuzzlePieceIcon, automotive: TruckIcon, "luxury-gifts": GiftIcon, "xvond-box": CubeIcon };

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: { absolute: "Xvond Smart Store" },
    description: locale === "ar" ? "تقنية مختارة لحياتك اليومية. اكتشف التقنية والإكسسوارات، للنساء، للأطفال، للسيارة، هدايا مميزة وXvond Box." : "Selected tech for everyday life. Explore tech and accessories, women, kids, car accessories, gift ideas and Xvond Box.",
    alternates: { canonical: absoluteUrl(`/${locale}`), languages: { "ar-OM": absoluteUrl("/ar"), "en-OM": absoluteUrl("/en") } },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  const [categories, products] = await Promise.all([getCategories(), getProducts({ sort: "newest", limit: 12 })]);
  return (
    <main className={styles.page}>
      <section className={styles.storeIntro}>
        <div>
          <p className={styles.xvondMark}>XVOND SMART STORE</p>
          <h1>{ar ? "تقنية مختارة لحياتك اليومية" : "Selected tech for everyday life"}</h1>
          <p className={styles.introCopy}>{ar ? "أجهزة وإكسسوارات عملية، وهدايا مميزة تجمع الفائدة والمتعة." : "Useful devices and accessories, with thoughtful gifts that combine function and fun."}</p>
          <Link href="#categories" className="primary-button">{ar ? "اكتشف الأقسام" : "Explore categories"}</Link>
        </div>
      </section>
      <section id="categories" className={styles.categoriesSection} aria-labelledby="categories-title">
        <h2 id="categories-title">{ar ? "تسوّق حسب الاستخدام" : "Shop by use"}</h2>
        <div className={styles.categoryRail}>
          {categories.map((category) => {
            const categoryProduct = products.find((product) => product.category === category.slug);
            const Icon = icons[category.slug as keyof typeof icons] ?? BoltIcon;
            return (
              <Link key={category.slug} href={`/${locale}/category/${category.slug}`} className={styles.categoryTile}>
                <span className={styles.categoryVisual}>
                  {categoryProduct ? <Image src={categoryProduct.image} alt="" fill sizes="(max-width: 640px) 45vw, (max-width: 900px) 30vw, 190px" className={styles.categoryImage} /> : <Icon className={styles.categoryIcon} />}
                </span>
                <strong>{category.label[locale]}</strong>
              </Link>
            );
          })}
        </div>
      </section>
      <section className={styles.productsSection}>
        <div className={styles.productsHeading}><h2>{ar ? "أحدث المنتجات" : "Latest products"}</h2><Link href={`/${locale}/new-arrivals`}>{ar ? "عرض المزيد" : "View more"}</Link></div>
        {products.length ? <div className={styles.productsGrid}>{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div> : <p className={styles.emptyState}>{ar ? "لا توجد منتجات منشورة حاليًا." : "No published products yet."}</p>}
      </section>
      <section className={styles.boxFeature}>
        <CubeIcon aria-hidden="true" />
        <div><p className={styles.xvondMark}>XVOND BOX</p><h2>{ar ? "اختيارات متناسقة في بوكس واحد" : "Complementary finds in one box"}</h2><p>{ar ? "اكتشف بوكسات تجمع منتجات مختارة حول فكرة أو استخدام محدد." : "Explore boxes of selected products built around a theme or use."}</p></div>
        <Link href={`/${locale}/category/xvond-box`} className="secondary-button">{ar ? "اكتشف Xvond Box" : "Explore Xvond Box"}</Link>
      </section>
    </main>
  );
}
