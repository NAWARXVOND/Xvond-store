import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/urls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), getProducts({ limit: 100 })]);
  const locales = ["ar", "en"];
  return locales.flatMap((locale) => [
    { url: absoluteUrl(`/${locale}`), changeFrequency: "daily" as const, priority: 1 },
    ...categories.map((category) => ({ url: absoluteUrl(`/${locale}/category/${category.slug}`), changeFrequency: "weekly" as const, priority: .8 })),
    ...products.map((product) => ({ url: absoluteUrl(`/${locale}/product/${product.slug}`), changeFrequency: "weekly" as const, priority: .7 }))
  ]);
}
