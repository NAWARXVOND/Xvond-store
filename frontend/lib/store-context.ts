import type { Locale } from "./i18n";

export type StoreContext = "lifestyle" | "smart";

export const LIFESTYLE_CATEGORY_SLUGS = ["women", "kids", "luxury-gifts", "automotive", "xvond-box"] as const;
export const SMART_CATEGORY_SLUGS = ["electronics"] as const;

const lifestyleSet = new Set<string>(LIFESTYLE_CATEGORY_SLUGS);
const smartSet = new Set<string>(SMART_CATEGORY_SLUGS);

export function storeForCategorySlug(slug?: string | null): StoreContext | null {
  if (!slug) return null;
  if (lifestyleSet.has(slug)) return "lifestyle";
  if (smartSet.has(slug)) return "smart";
  return null;
}

export function categorySlugsForStore(store: StoreContext): readonly string[] {
  return store === "lifestyle" ? LIFESTYLE_CATEGORY_SLUGS : SMART_CATEGORY_SLUGS;
}

export function storeHomePath(locale: Locale, store: StoreContext): string {
  return `/${locale}/${store}`;
}

export function storeNewArrivalsPath(locale: Locale, store: StoreContext): string {
  return `/${locale}/${store}/new-arrivals`;
}

export function storeForPath(pathname: string, locale: Locale, hintedStore?: string | null): StoreContext | null {
  if (hintedStore === "lifestyle" || hintedStore === "smart") return hintedStore;
  if (pathname.startsWith(`/${locale}/lifestyle`)) return "lifestyle";
  if (pathname.startsWith(`/${locale}/smart`)) return "smart";

  const categoryPrefix = `/${locale}/category/`;
  if (pathname.startsWith(categoryPrefix)) {
    return storeForCategorySlug(pathname.slice(categoryPrefix.length).split("/")[0]);
  }
  return null;
}

export function appendStoreContext(path: string, store: StoreContext | null): string {
  if (!store) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}store=${store}`;
}
