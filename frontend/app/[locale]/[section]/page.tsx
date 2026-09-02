import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

const sections = {
  cart: { ar: ["سلة التسوق", "لم تضف منتجات إلى السلة بعد."], en: ["Shopping cart", "Your cart is currently empty."] },
  checkout: { ar: ["إتمام الطلب", "سيتم تفعيل خطوات العنوان والدفع بعد اعتماد سياسات المتجر."], en: ["Checkout", "Address and payment steps will activate after store policies are approved."] },
  "track-order": { ar: ["تتبع الطلب", "أدخل رقم الطلب والبريد أو الهاتف لتتبع حالته."], en: ["Track order", "Enter your order number and email or phone to see its status."] },
  account: { ar: ["حسابي", "أساس حساب العميل جاهز للربط مع المصادقة."], en: ["My account", "The customer account foundation is ready for authentication."] },
  wishlist: { ar: ["المفضلة", "احفظ اختياراتك وارجع إليها لاحقًا."], en: ["Wishlist", "Save your favourites and return to them later."] }
} as const;

export default async function SectionPage({ params }: { params: Promise<{ locale: string; section: string }> }) {
  const { locale, section } = await params;
  if (!isLocale(locale) || !(section in sections)) notFound();
  const text = sections[section as keyof typeof sections][locale];
  return <main className="content-page shell"><h1>{text[0]}</h1><div className="empty-card"><p>{text[1]}</p></div></main>;
}

