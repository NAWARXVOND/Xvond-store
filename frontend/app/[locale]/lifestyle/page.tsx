import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, GiftIcon, ShoppingBagIcon, SparklesIcon, WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { getCategories } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";
import styles from "../store-channel.module.css";

const lifestyleSlugs = ["women", "kids", "luxury-gifts", "automotive"] as const;
const icons = { women: ShoppingBagIcon, kids: SparklesIcon, "luxury-gifts": GiftIcon, automotive: WrenchScrewdriverIcon } as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const ar = locale === "ar";
  return { title: `Xvond Lifestyle Store | Xvond Store`, description: ar ? "اختيارات Xvond Lifestyle من الأزياء والأطفال والهدايا ومستلزمات السيارة." : "Explore Xvond Lifestyle Store across fashion, kids, gifts and automotive essentials.", alternates: { canonical: absoluteUrl(`/${locale}/lifestyle`) } };
}

export default async function LifestylePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  const Arrow = ar ? ArrowLeftIcon : ArrowRightIcon;
  const categories = await getCategories();
  const lifestyle = lifestyleSlugs.map((slug) => categories.find((category) => category.slug === slug)).filter(Boolean);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}>XVOND LIFESTYLE STORE</p><h1>{ar ? "منتجات للحياة اليومية، بدون عشوائية المتجر العام." : "Everyday products without the randomness of a general store."}</h1><p>{ar ? "هون منجمع المنتجات التجارية اللي ممكن تتنوع مع الوقت، لكن ضمن ذوق واضح: عملية، مرتبة، قابلة للتسويق، ومناسبة لهوية Xvond." : "This is where commercial variety can grow, but within a clear standard: useful, well-presented, marketable and aligned with Xvond."}</p></div>
        <Link href={`/${locale}/smart`} className={styles.switchLink}>Xvond Smart Store<Arrow /></Link>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}><div><p>LIFESTYLE COLLECTIONS</p><h2>{ar ? "اختار القسم" : "Choose a collection"}</h2><span>{ar ? "نبدأ بعدد محدود من الأقسام والمنتجات، ونوسع فقط حسب اللي يثبت نفسه بالمبيعات." : "Start focused and expand only where products prove themselves through real sales."}</span></div></div>
        <div className={styles.grid}>
          {lifestyle.map((category, index) => {
            if (!category) return null;
            const Icon = icons[category.slug as keyof typeof icons] ?? ShoppingBagIcon;
            return <Link key={category.slug} href={`/${locale}/category/${category.slug}`} className={styles.card}><div className={styles.cardTop}><span className={styles.number}>{String(index + 1).padStart(2, "0")}</span><Icon /></div><div><h3>{category.label[locale]}</h3><p>{category.description[locale]}</p><span className={styles.explore}>{ar ? "تسوّق القسم" : "Shop collection"}<Arrow /></span></div></Link>;
          })}
        </div>
        <div className={styles.note}>{ar ? "Xvond Lifestyle Store مو متجر عام بلا حدود. أي فئة جديدة لازم تدخل كCollection واضحة ولها سبب تجاري، حتى يضل شكل المتجر مرتب حتى مع 20–30 منتج فقط." : "Xvond Lifestyle Store is not an unlimited general store. New categories should enter as deliberate collections with a commercial reason, keeping the store coherent even with only 20–30 products."}</div>
      </section>
    </main>
  );
}
