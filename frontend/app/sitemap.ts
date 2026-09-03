import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { storeForCategorySlug } from "@/lib/store-context";
import { absoluteUrl } from "@/lib/urls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts({ limit: 100 })]);
  const locales = ["ar", "en"] as const;
  const publicCategories = categories.filter((category) => Boolean(storeForCategorySlug(category.slug)));
  const publicProducts = products.filter((product) => Boolean(storeForCategorySlug(product.category)));

  return locales.flatMap((locale) => [
    { url: absoluteUrl(`/${locale}`), changeFrequency: "daily" as const, priority: 1 },
    { url: absoluteUrl(`/${locale}/lifestyle`), changeFrequency: "daily" as const, priority: .95 },
    { url: absoluteUrl(`/${locale}/smart`), changeFrequency: "daily" as const, priority: .95 },
    { url: absoluteUrl(`/${locale}/lifestyle/new-arrivals`), changeFrequency: "daily" as const, priority: .85 },
    { url: absoluteUrl(`/${locale}/smart/new-arrivals`), changeFrequency: "daily" as const, priority: .85 },
    ...publicCategories.map((category) => ({ url: absoluteUrl(`/${locale}/category/${category.slug}`), changeFrequency: "weekly" as const, priority: .8 })),
    ...publicProducts.map((product) => ({ url: absoluteUrl(`/${locale}/product/${product.slug}`), changeFrequency: "weekly" as const, priority: .7 })),
  ]);
}
