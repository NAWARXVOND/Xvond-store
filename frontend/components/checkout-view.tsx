"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { formatPrice } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { useCommerce } from "./commerce-provider";

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(180),
  email: z.email(),
  phone: z.string().trim().min(8).max(20),
  governorate: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  addressLine: z.string().trim().min(5).max(300)
});

export function CheckoutView({ locale }: { locale: Locale }) {
  const { cart, clearCart } = useCommerce();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const ar = locale === "ar";
  const subtotal = cart.reduce((total, line) => total + line.product.price * line.quantity, 0);

  async function submit(formData: FormData) {
    setError("");
    const values = Object.fromEntries(formData.entries());
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success || cart.length === 0) { setError(ar ? "راجع بيانات الطلب والسلة." : "Check your order details and cart."); return; }
    setBusy(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/orders`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: parsed.data, items: cart.map((line) => ({ product_slug: line.product.slug, quantity: line.quantity })) })
      });
      if (!response.ok) throw new Error("order_failed");
      const order = await response.json() as { order_number: string };
      clearCart();
      router.push(`/${locale}/order-confirmation?order=${encodeURIComponent(order.order_number)}`);
    } catch {
      setError(ar ? "تعذر إنشاء الطلب الآن. حاول مرة أخرى." : "We could not create the order. Please try again.");
    } finally { setBusy(false); }
  }

  return <main className="content-page shell commerce-page"><p className="eyebrow">SECURE CHECKOUT</p><h1>{ar ? "إتمام الطلب" : "Checkout"}</h1><div className="checkout-layout"><form className="checkout-form" action={submit}><h2>{ar ? "بيانات التواصل والتوصيل" : "Contact and delivery"}</h2><div className="form-grid"><label>{ar ? "الاسم الكامل" : "Full name"}<input name="fullName" autoComplete="name" required /></label><label>{ar ? "البريد الإلكتروني" : "Email"}<input name="email" type="email" autoComplete="email" required /></label><label>{ar ? "رقم الهاتف" : "Phone"}<input name="phone" type="tel" autoComplete="tel" required /></label><label>{ar ? "المحافظة" : "Governorate"}<input name="governorate" required /></label><label>{ar ? "المدينة" : "City"}<input name="city" required /></label><label className="full-field">{ar ? "العنوان بالتفصيل" : "Full address"}<textarea name="addressLine" rows={3} required /></label></div><div className="pending-choice"><strong>{ar ? "الدفع والتوصيل" : "Payment and delivery"}</strong><p>{ar ? "سيتم عرض الخيارات بعد اعتماد مزوّد الدفع وشركة الشحن. لن يتم تحصيل أي مبلغ الآن." : "Options will appear after payment and shipping providers are approved. No payment is collected now."}</p></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={busy || cart.length === 0}>{busy ? (ar ? "جارٍ إنشاء الطلب…" : "Creating order…") : (ar ? "إنشاء طلب مبدئي" : "Create pending order")}</button></form><aside className="order-summary"><h2>{ar ? "طلبك" : "Your order"}</h2>{cart.map((line) => <div key={line.product.slug}><span>{line.product.name[locale]} × {line.quantity}</span><strong>{formatPrice(line.product.price * line.quantity, locale)}</strong></div>)}<hr /><div><span>{ar ? "المجموع الفرعي" : "Subtotal"}</span><strong>{formatPrice(subtotal, locale)}</strong></div></aside></div></main>;
}

