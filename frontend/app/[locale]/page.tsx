import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BoltIcon, CubeIcon, GiftIcon, PuzzlePieceIcon, ShieldCheckIcon, SparklesIcon, TruckIcon } from "@heroicons/react/24/outline";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";
import styles from "./store-channel.module.css";

const icons = {
  electronics: BoltIcon,
  women: SparklesIcon,
  kids: PuzzlePieceIcon,
  automotive: TruckIcon,
  "luxury-gifts": GiftIcon,
  "xvond-box": CubeIcon,
};

const categoryArtwork: Record<string, string> = {
  electronics: "/category-art/electronics.svg",
  women: "/category-art/women.svg",
  kids: "/category-art/kids.svg",
  automotive: "/category-art/automotive.svg",
  "luxury-gifts": "/category-art/luxury-gifts.svg",
  "xvond-box": "/category-art/xvond-box.svg",
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: { absolute: "Xvond Smart Store" },
    description: locale === "ar"
      ? "تقنية مختارة لحياتك اليومية. اكتشف التقنية والإكسسوارات، للنساء، للأطفال، للسيارة، هدايا مميزة وXvond Box."
      : "Selected tech for everyday life. Explore tech and accessories, women, kids, car accessories, gift ideas and Xvond Box.",
    alternates: { canonical: absoluteUrl(`/${locale}`), languages: { "ar-OM": absoluteUrl("/ar"), "en-OM": absoluteUrl("/en") } },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const [categories, products] = await Promise.all([getCategories(), getProducts({ sort: "newest", limit: 12 })]);

  return (
    <main className={styles.page}>
      <section
        className={styles.heroBanner}
        aria-labelledby="hero-title"
      >
        <Image
          src={`${basePath}/assets/hero-no-text.png`}
          alt=""
          fill
          priority
          sizes="100vw"
          className={styles.heroBannerImage}
        />
        <div className={styles.bannerCopy} dir={ar ? "rtl" : "ltr"}>
          <p className={styles.bannerEyebrow}>{ar ? "اختيارات ذكية. لحياة أجمل." : "SMARTER CHOICES. BETTER LIVING."}</p>
          <h1 id="hero-title" className={styles.bannerTitle}>
            <span className={styles.bannerTitleLead}>{ar ? "منتجات تفهمك." : "PRODUCTS THAT GET YOU."}</span>
            <span>{ar ? "وتفاصيل تشبهك." : "DETAILS THAT DEFINE YOU."}</span>
          </h1>
          <p className={styles.bannerDescription}>{ar
            ? "اكتشف تقنية مختارة ومنتجات ذكية تضيف ليومك راحة، ولحياتك أسلوبًا."
            : "Discover thoughtfully selected tech and smart essentials that bring ease to your day and style to your life."}</p>
          <ul className={styles.bannerBenefits}>
            <li><TruckIcon aria-hidden="true" /><span>{ar ? "توصيل سريع" : "Fast delivery"}</span></li>
            <li><SparklesIcon aria-hidden="true" /><span>{ar ? "جودة مختارة" : "Selected quality"}</span></li>
            <li><ShieldCheckIcon aria-hidden="true" /><span>{ar ? "تسوّق ودفع آمن" : "Secure shopping & payment"}</span></li>
            <li><BoltIcon aria-hidden="true" /><span>{ar ? "منتجات ذكية" : "Smart products"}</span></li>
            <li><CubeIcon aria-hidden="true" /><span>{ar ? "أسلوب حياة عصري" : "Modern lifestyle"}</span></li>
            <li><GiftIcon aria-hidden="true" /><span>{ar ? "حياة أكثر سهولة" : "Everyday made easier"}</span></li>
          </ul>
        </div>
      </section>

      <section id="categories" className={styles.categoriesSection} aria-labelledby="categories-title">
        <div className={styles.sectionHeading}>
          <h2 id="categories-title">{ar ? "حسب الفئات" : "Shop by Category"}</h2>
          <Link href={`/${locale}/search`}>{ar ? "استكشف كل الفئات" : "Explore All Categories"} →</Link>
        </div>
        <div className={styles.categoryRail}>
          {categories.map((category) => {
            const categoryProduct = products.find((product) => product.category === category.slug && !product.image.includes("product-placeholder.svg"));
            const Icon = icons[category.slug as keyof typeof icons] ?? BoltIcon;
            const artwork = `${basePath}${categoryArtwork[category.slug] ?? "/category-art/electronics.svg"}`;
            return (
              <Link key={category.slug} href={`/${locale}/category/${category.slug}`} className={styles.categoryTile}>
                <span className={styles.categoryVisual}>
                  <Image
                    src={categoryProduct?.image ?? artwork}
                    alt={category.label[locale]}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 980px) 45vw, 16vw"
                    className={styles.categoryImage}
                  />
                  <span className={styles.categoryShade} aria-hidden="true" />
                  <span className={styles.categoryCopy} style={{ display: "flex", alignItems: "center", gap: ".42rem" }}>
                    <Icon style={{ gridRow: 1, flexShrink: 0 }} />
                    <strong style={{ flex: 1 }}>{category.label[locale]}</strong>
                    <b aria-hidden="true" style={{ gridRow: 1, marginInlineStart: "auto" }}>›</b>
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.productsSection}>
        <div className={styles.productsHeading}>
          <h2>{ar ? "أحدث المنتجات" : "Featured Products"}</h2>
          <Link href={`/${locale}/new-arrivals`}>{ar ? "عرض كل المنتجات" : "View All Products"} →</Link>
        </div>
        {products.length
          ? <div className={styles.productsGrid}>{products.map((product) => <ProductCard key={product.id} product={product} locale={locale} />)}</div>
          : <p className={styles.emptyState}>{ar ? "لا توجد منتجات منشورة حاليًا." : "No published products yet."}</p>}
      </section>

      <section className={styles.boxFeature}>
        <div className={styles.boxArt}>
          <Image src={`${basePath}/category-art/xvond-box.svg`} alt="" fill sizes="360px" />
        </div>
        <div className={styles.boxCopy}>
          <p className={styles.xvondMark}>XVOND BOX</p>
          <h2>{ar ? "اختيارات متناسقة في بوكس واحد" : "Complementary finds in one box"}</h2>
          <p>{ar ? "بوكسات تجمع منتجات مختارة حول فكرة أو استخدام محدد، ضمن تجربة Xvond Smart Store." : "Boxes of complementary products built around a theme or use, curated for the Xvond Smart Store experience."}</p>
          <Link href={`/${locale}/category/xvond-box`} className={styles.boxLink}>{ar ? "اكتشف Xvond Box" : "Explore Xvond Box"}</Link>
        </div>
      </section>
    </main>
  );
}
