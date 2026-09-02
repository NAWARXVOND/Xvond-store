import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/product-card";
import { getCategories, getProducts } from "@/lib/catalog";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";

type Query = { min?: string; max?: string; stock?: string; sort?: "newest" | "price-asc" | "price-desc" };

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  const title = category?.label[locale] || (locale === "ar" ? "وصل حديثًا" : "New Arrivals");
  return {
    title,
    description: category?.description[locale],
    alternates: { canonical: absoluteUrl(`/${locale}/category/${slug}`) },
  };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<Query> }) {
  const [{ locale, slug }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const categories = await getCategories();
  const category = categories.find((item) => item.slug === slug);
  if (!category && slug !== "new-arrivals") notFound();
  const products = await getProducts({
    category: category?.slug,
    minPrice: query.min,
    maxPrice: query.max,
    inStock: query.stock === "1",
    sort: query.sort || "newest",
  });
  const ar = locale === "ar";
  const title = category?.label[locale] || (ar ? "وصل حديثًا" : "New Arrivals");

  return (
    <main className="content-page shell">
      <p className="eyebrow">XVOND COLLECTION</p>
      <h1>{title}</h1>
      {category?.description[locale] && <p className="page-intro">{category.description[locale]}</p>}
      <form className="catalog-filters">
        <label>{ar ? "السعر من" : "Min price"}<input name="min" type="number" min="0" step="0.001" defaultValue={query.min} /></label>
        <label>{ar ? "السعر إلى" : "Max price"}<input name="max" type="number" min="0" step="0.001" defaultValue={query.max} /></label>
        <label>{ar ? "الترتيب" : "Sort"}<select name="sort" defaultValue={query.sort || "newest"}><option value="newest">{ar ? "الأحدث" : "Newest"}</option><option value="price-asc">{ar ? "السعر: الأقل" : "Price: low"}</option><option value="price-desc">{ar ? "السعر: الأعلى" : "Price: high"}</option></select></label>
        <label className="filter-check"><input name="stock" type="checkbox" value="1" defaultChecked={query.stock === "1"} />{ar ? "المتوفر فقط" : "In stock only"}</label>
        <button className="secondary-button" type="submit">{ar ? "تطبيق" : "Apply"}</button>
      </form>
      {products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.slug} product={product} locale={locale} />)}</div> : <div className="empty-card"><p>{ar ? "لا توجد منتجات مطابقة حاليًا." : "No matching products right now."}</p></div>}
    </main>
  );
}
