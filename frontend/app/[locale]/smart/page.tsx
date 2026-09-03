import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, ArrowRightIcon, BoltIcon, CpuChipIcon, GiftIcon, SparklesIcon } from "@heroicons/react/24/outline";
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
  return { title: `Xvond Smart Store | Xvond Store`, description: ar ? "الجانب التقني من Xvond Store للمنتجات الذكية والإلكترونيات وXvond Box، مع توسع مستقبلي نحو AI devices." : "The technology side of Xvond Store for smart products, electronics and Xvond Box, with a future path toward AI devices.", alternates: { canonical: absoluteUrl(`/${locale}/smart`) } };
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
      <section className={`${styles.hero} ${styles.heroSmart}`}>
        <div><p className={styles.eyebrow}>XVOND SMART STORE</p><h1>{ar ? "الخط اللي رح يربط المتجر مباشرة بهوية Xvond AI." : "The store line that connects directly to Xvond AI."}</h1><p>{ar ? "نبدأ بمنتجات تقنية وSmart حقيقية، وبعدين نضيف تدريجيًا Smart Work، Creator Tools، Smart Home، Xvond AI Devices والـkits الخاصة فينا." : "Start with real smart and technology products, then expand gradually into Smart Work, Creator Tools, Smart Home, Xvond AI devices and our own kits."}</p></div>
        <Link href={`/${locale}/lifestyle`} className={styles.switchLink}>Xvond Lifestyle Store<Arrow /></Link>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}><div><p>SMART COLLECTIONS</p><h2>{ar ? "البداية الذكية" : "The smart starting point"}</h2><span>{ar ? "ما رح نخترع أقسام فاضية. منعرض الموجود فعليًا، وكل ما ندخل منتجات حقيقية منضيف Collection واضحة." : "No empty invented departments. We show what actually exists, then add clear collections as real products are introduced."}</span></div></div>
        <div className={styles.grid}>
          {smart.map((category, index) => {
            if (!category) return null;
            const Icon = icons[category.slug as keyof typeof icons] ?? CpuChipIcon;
            return <Link key={category.slug} href={`/${locale}/category/${category.slug}`} className={`${styles.card} ${styles.smartCard}`}><div className={styles.cardTop}><span className={styles.number}>{String(index + 1).padStart(2, "0")}</span><Icon /></div><div><h3>{category.slug === "electronics" ? (ar ? "Smart Tech" : "Smart Tech") : category.label[locale]}</h3><p>{category.description[locale]}</p><span className={styles.explore}>{ar ? "استكشف" : "Explore"}<Arrow /></span></div></Link>;
          })}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}><div><p>NEXT FOR XVOND SMART</p><h2>{ar ? "التوسع يكون حسب المنتجات الحقيقية" : "Expansion follows real products"}</h2></div></div>
        <div className={styles.grid}>
          <div className={`${styles.card} ${styles.smartCard}`}><div className={styles.cardTop}><span className={styles.number}>NEXT</span><SparklesIcon /></div><div><h3>Smart Work & Creator</h3><p>{ar ? "أدوات مكتب، اجتماعات وصناعة محتوى ذكية وقت يكون عنا منتجات فعلية ضمن هالخط." : "Smart desk, meeting and creator tools once real products are stocked in this line."}</p></div></div>
          <div className={`${styles.card} ${styles.smartCard}`}><div className={styles.cardTop}><span className={styles.number}>FUTURE</span><CpuChipIcon /></div><div><h3>Xvond AI Devices</h3><p>{ar ? "أجهزة وkits مرتبطة بخدمات Xvond AI لاحقًا، من غير ما نوعد بمنتجات قبل ما تكون جاهزة." : "Devices and kits connected to Xvond AI later, without presenting products before they are actually ready."}</p></div></div>
        </div>
        <div className={styles.actions}><Link href={`/${locale}/category/new-arrivals`}>{ar ? "شوف الجديد" : "See new arrivals"}<Arrow /></Link><Link href={`/${locale}/shop`}>{ar ? "كل Xvond Store" : "All Xvond Store"}<Arrow /></Link></div>
      </section>
    </main>
  );
}
