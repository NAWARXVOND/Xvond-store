import type { Locale } from "./i18n";

export type Category = {
  id: string;
  slug: string;
  label: { ar: string; en: string };
  description: { ar?: string; en?: string };
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  category: string;
  name: { ar: string; en: string };
  description: { ar?: string; en?: string };
  price: number;
  previousPrice?: number;
  image: string;
  variantId?: string;
  stock: number;
};

type ApiCategory = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar?: string | null;
  description_en?: string | null;
};

type ApiVariant = {
  id: string;
  price: string | number;
  compare_at_price?: string | number | null;
  stock_quantity: number;
};

type ApiProduct = {
  id: string;
  slug: string;
  sku: string;
  name_ar: string;
  name_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  primary_image_url?: string | null;
  category: ApiCategory;
  variants: ApiVariant[];
};

export type ProductFilters = {
  category?: string;
  query?: string;
  minPrice?: string;
  maxPrice?: string;
  inStock?: boolean;
  sort?: "newest" | "price-asc" | "price-desc";
  limit?: number;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1000&q=85";

function toCategory(category: ApiCategory): Category {
  return {
    id: category.id,
    slug: category.slug,
    label: { ar: category.name_ar, en: category.name_en },
    description: {
      ar: category.description_ar ?? undefined,
      en: category.description_en ?? undefined,
    },
  };
}

function toProduct(product: ApiProduct): Product {
  const variant = product.variants[0];
  return {
    id: product.id,
    slug: product.slug,
    sku: product.sku,
    category: product.category.slug,
    name: { ar: product.name_ar, en: product.name_en },
    description: {
      ar: product.description_ar ?? undefined,
      en: product.description_en ?? undefined,
    },
    price: Number(variant?.price ?? 0),
    previousPrice: variant?.compare_at_price == null ? undefined : Number(variant.compare_at_price),
    image: product.primary_image_url || FALLBACK_IMAGE,
    variantId: variant?.id,
    stock: product.variants.reduce((total, item) => total + item.stock_quantity, 0),
  };
}

async function apiFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  const data = await apiFetch<ApiCategory[]>("/catalog/categories");
  return data?.map(toCategory) ?? [];
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.query) params.set("query", filters.query);
  if (filters.minPrice) params.set("min_price", filters.minPrice);
  if (filters.maxPrice) params.set("max_price", filters.maxPrice);
  if (filters.inStock) params.set("in_stock", "true");
  if (filters.sort) params.set("sort", filters.sort);
  params.set("limit", String(filters.limit ?? 24));
  const data = await apiFetch<ApiProduct[]>(`/catalog/products?${params}`);
  return data?.map(toProduct) ?? [];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const data = await apiFetch<ApiProduct>(`/catalog/products/${encodeURIComponent(slug)}`);
  return data ? toProduct(data) : null;
}

export const formatPrice = (price: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "ar" ? "ar-OM" : "en-OM", {
    style: "currency",
    currency: "OMR",
    minimumFractionDigits: 3,
  }).format(price);
