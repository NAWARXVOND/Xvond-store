import type { MetadataRoute } from "next";
import { categories, products } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["ar", "en"];
  return locales.flatMap((locale) => [
    { url: absoluteUrl(`/${locale}`), changeFrequency: "daily" as const, priority: 1 },
    ...categories.map((category) => ({ url: absoluteUrl(`/${locale}/category/${category.slug}`), changeFrequency: "weekly" as const, priority: .8 })),
    ...products.map((product) => ({ url: absoluteUrl(`/${locale}/product/${product.slug}`), changeFrequency: "weekly" as const, priority: .7 }))
  ]);
}

