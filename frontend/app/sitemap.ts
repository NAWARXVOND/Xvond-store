import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/catalog";
import type { Product } from "@/lib/catalog";
import { absoluteUrl } from "@/lib/urls";

async function allProducts(): Promise<Product[]> {
  const pageSize = 100;
  const products: Product[] = [];
  for (let offset = 0; ; offset += pageSize) {
    const page = await getProducts({ limit: pageSize, offset });
    products.push(...page);
    if (page.length < pageSize) break;
  }
  return products;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), allProducts()]);
  const locales = ["ar", "en"] as const;

  return locales.flatMap((locale) => [
    { url: absoluteUrl(`/${locale}`), changeFrequency: "daily" as const, priority: 1 },
    { url: absoluteUrl(`/${locale}/new-arrivals`), changeFrequency: "daily" as const, priority: .85 },
    ...categories.map((category) => ({ url: absoluteUrl(`/${locale}/category/${category.slug}`), changeFrequency: "weekly" as const, priority: .8 })),
    ...products.map((product) => ({ url: absoluteUrl(`/${locale}/product/${product.slug}`), changeFrequency: "weekly" as const, priority: .7 })),
  ]);
}
