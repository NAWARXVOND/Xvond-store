"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  addressLine: z.string().trim().min(5).max(300),
  couponCode: z.string().trim().max(60)
});

type Quote = {
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  grand_total: number;
  promotion_code?: string | null;
  shipping_available: boolean;
  estimated_days_min?: number | null;
  estimated_days_max?: number | null;
};
type PendingPayment = { orderNumber: string; email: string };

export function CheckoutView({ locale }: { locale: Locale }) {
  const { cart, clearCart } = useCommerce();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [tapEnabled, setTapEnabled] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const router = useRouter();
  const ar = locale === "ar";
  const subtotal = cart.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  async function requestQuote(code = "", destination = governorate) {
    const response = await fetch(`${apiUrl}/orders/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((line) => ({ product_slug: line.product.slug, quantity: line.quantity })),
        coupon_code: code || null,
        governorate: destination.trim() || null
      }),
    });
    if (!response.ok) throw new Error("quote_failed");
    return await response.json() as Quote;
  }

  useEffect(() => {
    void fetch(`${apiUrl}/payments/config`).then(async (response) => {
      if (!response.ok) return;
      const value = await response.json() as { tap_enabled: boolean };
      setTapEnabled(value.tap_enabled);
    }).catch(() => undefined);
  }, [apiUrl]);

  useEffect(() => {
    if (!cart.length) return;
    let active = true;
    void requestQuote("", "").then((value) => { if (active) setQuote(value); }).catch(() => undefined);
    return () => { active = false; };
  // Cart contents are intentionally the quote dependency.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  async function refreshShipping(destination: string) {
    if (destination.trim().length < 2) return;
    try {
      const value = await requestQuote(coupon.trim(), destination);
      setQuote(value);
      if (!value.shipping_available) {
        setError(ar ? "التوصيل غير متاح لهذه المحافظة حاليًا." : "Delivery is not available for this governorate yet.");
      } else {
        setError("");
      }
    } catch {
      setError(ar ? "تعذر حساب التوصيل الآن." : "Could not calculate delivery right now.");
    }
  }

  async function applyCoupon() {
    setCouponMessage("");
    try {
      const value = await requestQuote(coupon.trim());
      setQuote(value);
      setCouponMessage(value.promotion_code === coupon.trim().toUpperCase() ? (ar ? "تم تطبيق الكوبون." : "Coupon applied.") : (ar ? "يوجد خصم تلقائي أفضل وتم تطبيقه." : "A better automatic discount was applied."));
    } catch {
      setCouponMessage(ar ? "الكوبون غير صالح أو غير متاح." : "Coupon is invalid or unavailable.");
    }
  }

  async function paymentUrl(orderNumber: string, email: string) {
    const response = await fetch(`${apiUrl}/payments/tap/orders/${encodeURIComponent(orderNumber)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale })
    });
    if (!response.ok) throw new Error("payment_failed");
    const payment = await response.json() as { payment_url: string };
    return payment.payment_url;
  }

  async function submit(formData: FormData) {
    setError("");
    const values = Object.fromEntries(formData.entries());
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success || cart.length === 0) { setError(ar ? "راجع بيانات الطلب والسلة." : "Check your order details and cart."); return; }
    setBusy(true);
    try {
      if (tapEnabled && pendingPayment) {
        const url = await paymentUrl(pendingPayment.orderNumber, pendingPayment.email);
        clearCart();
        window.location.assign(url);
        return;
      }
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: parsed.data, items: cart.map((line) => ({ product_slug: line.product.slug, quantity: line.quantity })), coupon_code: parsed.data.couponCode || null })
      });
      if (!response.ok) throw new Error("order_failed");
      const order = await response.json() as { order_number: string };
      if (tapEnabled) {
        setPendingPayment({ orderNumber: order.order_number, email: parsed.data.email });
        const url = await paymentUrl(order.order_number, parsed.data.email);
        clearCart();
        window.location.assign(url);
        return;
      }
      clearCart();
      router.push(`/${locale}/order-confirmation?order=${encodeURIComponent(order.order_number)}`);
    } catch {
      setError(tapEnabled && pendingPayment
        ? (ar ? "تعذر فتح صفحة الدفع. الطلب محفوظ، اضغط المحاولة مرة أخرى." : "Payment could not be opened. Your order is saved; try again.")
        : (ar ? "تعذر إكمال الطلب. تأكد أن التوصيل متاح لمحافظتك." : "We could not complete the order. Check that delivery is available for your governorate."));
    } finally { setBusy(false); }
  }

  const buttonText = busy
    ? (ar ? "جارٍ المتابعة…" : "Continuing…")
    : tapEnabled
      ? pendingPayment
        ? (ar ? "إعادة محاولة الدفع" : "Retry payment")
        : (ar ? "المتابعة للدفع الآمن" : "Continue to secure payment")
      : (ar ? "إنشاء الطلب" : "Create order");

  return <main className="content-page shell commerce-page"><p className="eyebrow">SECURE CHECKOUT</p><h1>{ar ? "إتمام الطلب" : "Checkout"}</h1><div className="checkout-layout"><form className="checkout-form" action={submit}><h2>{ar ? "بيانات التواصل والتوصيل" : "Contact and delivery"}</h2><div className="form-grid"><label>{ar ? "الاسم الكامل" : "Full name"}<input name="fullName" autoComplete="name" required /></label><label>{ar ? "البريد الإلكتروني" : "Email"}<input name="email" type="email" autoComplete="email" required /></label><label>{ar ? "رقم الهاتف" : "Phone"}<input name="phone" type="tel" autoComplete="tel" required /></label><label>{ar ? "المحافظة" : "Governorate"}<input name="governorate" value={governorate} onChange={(event) => setGovernorate(event.target.value)} onBlur={(event) => void refreshShipping(event.currentTarget.value)} required /></label><label>{ar ? "المدينة" : "City"}<input name="city" required /></label><label className="full-field">{ar ? "العنوان بالتفصيل" : "Full address"}<textarea name="addressLine" rows={3} required /></label></div><div className="coupon-entry"><label>{ar ? "كود الخصم" : "Coupon code"}<input name="couponCode" value={coupon} onChange={(event) => setCoupon(event.target.value)} maxLength={60} dir="ltr" /></label><button className="secondary-button" type="button" onClick={() => void applyCoupon()} disabled={!coupon.trim()}>{ar ? "تطبيق" : "Apply"}</button></div>{couponMessage && <p className="coupon-message">{couponMessage}</p>}{quote?.shipping_available && <div className="pending-choice"><strong>{ar ? "التوصيل" : "Delivery"}</strong><p>{quote.shipping_total === 0 ? (ar ? "توصيل مجاني" : "Free delivery") : `${formatPrice(quote.shipping_total, locale)} · ${quote.estimated_days_min}-${quote.estimated_days_max} ${ar ? "أيام" : "days"}`}</p></div>}<div className="pending-choice"><strong>{ar ? "الدفع" : "Payment"}</strong><p>{tapEnabled ? (ar ? "الدفع الإلكتروني الآمن عبر Tap. ستظهر لك وسائل الدفع المفعّلة لحساب المتجر في صفحة Tap." : "Secure online payment through Tap. The payment methods enabled for the store will appear on Tap's hosted page.") : (ar ? "الدفع الإلكتروني غير مفعّل بعد. سيتم إنشاء الطلب بدون تحصيل مبلغ." : "Online payment is not enabled yet. The order will be created without collecting payment.")}</p></div>{error && <p className="form-error" role="alert">{error}</p>}<p className="checkout-legal">{ar ? "بإتمام الطلب، أنت توافق على" : "By placing the order, you agree to the"} <Link href={`/${locale}/terms`}>{ar ? "شروط الاستخدام" : "Terms of Use"}</Link> {ar ? "وتقر بالاطلاع على" : "and acknowledge the"} <Link href={`/${locale}/privacy`}>{ar ? "سياسة الخصوصية" : "Privacy Policy"}</Link> {ar ? "و" : "and"} <Link href={`/${locale}/returns`}>{ar ? "سياسة الاسترجاع والتبديل" : "Return & Exchange Policy"}</Link>.</p><button className="primary-button" disabled={busy || cart.length === 0}>{buttonText}</button></form><aside className="order-summary"><h2>{ar ? "طلبك" : "Your order"}</h2>{cart.map((line) => <div key={line.product.slug}><span>{line.product.name[locale]} × {line.quantity}</span><strong>{formatPrice(line.product.price * line.quantity, locale)}</strong></div>)}<hr /><div><span>{ar ? "المجموع الفرعي" : "Subtotal"}</span><strong>{formatPrice(quote?.subtotal ?? subtotal, locale)}</strong></div>{quote && quote.discount_total > 0 && <div className="discount-line"><span>{ar ? `الخصم (${quote.promotion_code})` : `Discount (${quote.promotion_code})`}</span><strong>-{formatPrice(quote.discount_total, locale)}</strong></div>}{quote?.shipping_available && <div><span>{ar ? "التوصيل" : "Delivery"}</span><strong>{quote.shipping_total === 0 ? (ar ? "مجاني" : "Free") : formatPrice(quote.shipping_total, locale)}</strong></div>}<hr /><div><span>{ar ? "الإجمالي" : "Total"}</span><strong>{formatPrice(quote?.grand_total ?? subtotal, locale)}</strong></div></aside></div></main>;
}
