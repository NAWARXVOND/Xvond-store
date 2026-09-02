export type Product = {
  slug: string;
  category: "women" | "kids" | "electronics" | "xvond-box" | "luxury-gifts";
  name: { ar: string; en: string };
  price: number;
  previousPrice?: number;
  badge?: { ar: string; en: string };
  image: string;
};

export const categories = [
  { slug: "women", label: { ar: "نساء", en: "Women" }, symbol: "W" },
  { slug: "kids", label: { ar: "أطفال", en: "Kids" }, symbol: "K" },
  { slug: "electronics", label: { ar: "إلكترونيات", en: "Electronics" }, symbol: "E" },
  { slug: "xvond-box", label: { ar: "Xvond Box", en: "Xvond Box" }, symbol: "X" },
  { slug: "luxury-gifts", label: { ar: "هدايا فاخرة", en: "Luxury Gifts" }, symbol: "G" }
] as const;

export const products: Product[] = [
  { slug: "midnight-signature-box", category: "xvond-box", name: { ar: "بوكس ميدنايت سيغنتشر", en: "Midnight Signature Box" }, price: 29.9, badge: { ar: "حصري", en: "Exclusive" }, image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1000&q=85" },
  { slug: "aurora-wireless-headphones", category: "electronics", name: { ar: "سماعات أورورا اللاسلكية", en: "Aurora Wireless Headphones" }, price: 44.9, previousPrice: 54.9, badge: { ar: "عرض", en: "Offer" }, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85" },
  { slug: "celeste-evening-bag", category: "women", name: { ar: "حقيبة سيليست المسائية", en: "Celeste Evening Bag" }, price: 36.5, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1000&q=85" },
  { slug: "little-explorer-set", category: "kids", name: { ar: "مجموعة المستكشف الصغير", en: "Little Explorer Set" }, price: 18.0, badge: { ar: "جديد", en: "New" }, image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=1000&q=85" },
  { slug: "noir-occasion-set", category: "luxury-gifts", name: { ar: "طقم نوار للمناسبات", en: "Noir Occasion Set" }, price: 52.0, image: "https://images.unsplash.com/photo-1607082349566-187342175e2f?auto=format&fit=crop&w=1000&q=85" },
  { slug: "mini-smart-speaker", category: "electronics", name: { ar: "مكبر صوت ذكي ميني", en: "Mini Smart Speaker" }, price: 24.9, image: "https://images.unsplash.com/photo-1589003077984-894e133dabab?auto=format&fit=crop&w=1000&q=85" }
];

export const formatPrice = (price: number, locale: "ar" | "en") =>
  new Intl.NumberFormat(locale === "ar" ? "ar-OM" : "en-OM", {
    style: "currency",
    currency: "OMR",
    minimumFractionDigits: 3
  }).format(price);

