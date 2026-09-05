"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { formatPrice } from "@/lib/catalog";
import type { Locale } from "@/lib/i18n";
import { cartLineKey, useCommerce } from "./commerce-provider";

const OMAN_GOVERNORATES = [
  { value: "muscat", ar: "مسقط", en: "Muscat" },
  { value: "dhofar", ar: "ظفار", en: "Dhofar" },
  { value: "musandam", ar: "مسندم", en: "Musandam" },
  { value: "al buraimi", ar: "البريمي", en: "Al Buraimi" },
  { value: "ad dakhiliyah", ar: "الداخلية", en: "Ad Dakhiliyah" },
  { value: "north al batinah", ar: "شمال الباطنة", en: "North Al Batinah" },
  { value: "south al batinah", ar: "جنوب الباطنة", en: "South Al Batinah" },
  { value: "north ash sharqiyah", ar: "شمال الشرقية", en: "North Ash Sharqiyah" },
  { value: "south ash sharqiyah", ar: "جنوب الشرقية", en: "South Ash Sharqiyah" },
  { value: "al wusta", ar: "الوسطى", en: "Al Wusta" },
  { value: "ad dhahirah", ar: "الظاهرة", en: "Ad Dhahirah" },
] as const;

const checkoutSchema = z.object({
  fullName: z.string().trim().min(2).max(180),
  email: z.email(),
  phone: z.string().trim().min(8).max(20),
  countryCode: z.literal("OM"),
  governorate: z.enum(OMAN_GOVERNORATES.map((item) => item.value) as [string, ...string[]]),
  city: z.string().trim().min(2).max(120),
  addressLine: z.string().trim().min(5).max(300),
  couponCode: z.string().trim().max(60),
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
type PaymentMethod = "tap" | "cash_on_delivery";

export function CheckoutView({ locale }: { locale: Locale }) {
  const { cart, clearCart } = useCommerce();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [governorate, setGovernorate] = useState("");
  const [tapEnabled, setTapEnabled] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash_on_delivery");
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(null);
  const router = useRouter();
  const ar = locale === "ar";
  const subtotal = cart.reduce((total, line) => total + line.product.price * line.quantity, 0);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
  const checkoutItems = useMemo(
    () => cart.map((line) => ({
      product_slug: line.product.slug,
      variant_id: line.product.variantId ?? null,
      quantity: line.quantity,
    })),
    [cart],
  );

  async function requestQuote(code = "", destination = governorate) {
    const response = await fetch(`${apiUrl}/orders/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: checkoutItems,
        coupon_code: code || null,
        governorate: destination.trim() || null,
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
  // checkoutItems changes exactly when cart contents change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutItems]);

  async function refreshShipping(destination: string) {
    if (!destination) return;
    try {
      const value = await requestQuote(coupon.trim(), destination);
      setQuote(value);
      if (!value.shipping_available) {
        setError(ar ? "التوصيل غير متاح لهذه المحافظة داخل سلطنة عُمان حاليًا." : "Delivery is not currently available for this governorate in Oman.");
      } else {
        setError("");
      }
    } catch {
      setError(ar ? "تعذر التحقق من منطقة التوصيل الآن." : "Could not verify the delivery area right now.");
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
      body: JSON.stringify({ email, locale }),
    });
    if (!response.ok) throw new Error("payment_failed");
    const payment = await response.json() as { payment_url: string };
    return payment.payment_url;
  }

  async function submit(formData: FormData) {
    setError("");
    const values = Object.fromEntries(formData.entries());
    const parsed = checkoutSchema.safeParse(values);
    if (!parsed.success || cart.length === 0) {
      setError(ar ? "راجع بيانات الطلب والسلة." : "Check your order details and cart.");
      return;
    }
    if (checkoutItems.some((item) => !item.variant_id)) {
      setError(ar ? "أعد اختيار خيار المنتج قبل إتمام الطلب." : "Please reselect the product option before checkout.");
      return;
    }
    setBusy(true);
    try {
      if (paymentMethod === "tap" && pendingPayment) {
        const url = await paymentUrl(pendingPayment.orderNumber, pendingPayment.email);
        clearCart();
        window.location.assign(url);
        return;
      }
      const { couponCode, ...customer } = parsed.data;
      const response = await fetch(`${apiUrl}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer,
          items: checkoutItems,
          coupon_code: couponCode || null,
          payment_method: paymentMethod,
        }),
      });
      if (!response.ok) throw new Error("order_failed");
      const order = await response.json() as { order_number: string };
      if (paymentMethod === "tap") {
        setPendingPayment({ orderNumber: order.order_number, email: parsed.data.email });
        const url = await paymentUrl(order.order_number, parsed.data.email);
        clearCart();
        window.location.assign(url);
        return;
      }
      clearCart();
      router.push(`/${locale}/order-confirmation?order=${encodeURIComponent(order.order_number)}&payment=cod`);
    } catch {
      setError(paymentMethod === "tap" && pendingPayment
        ? (ar ? "تعذر فتح صفحة الدفع. الطلب محفوظ، اضغط المحاولة مرة أخرى." : "Payment could not be opened. Your order is saved; try again.")
        : (ar ? "تعذر إكمال الطلب. تحقق من المخزون وبيانات التوصيل ثم حاول مجددًا." : "We could not complete the order. Check stock and delivery details, then try again."));
    } finally {
      setBusy(false);
    }
  }

  const buttonText = busy
    ? (ar ? "جارٍ المتابعة…" : "Continuing…")
    : paymentMethod === "tap"
      ? pendingPayment
        ? (ar ? "إعادة محاولة الدفع" : "Retry payment")
        : (ar ? "المتابعة للدفع الآمن" : "Continue to secure payment")
      : (ar ? "تأكيد الطلب والدفع عند الاستلام" : "Place order · Cash on delivery");

  const eyebrow = "XVOND SMART STORE";

  return <main className="content-page shell commerce-page"><p className="eyebrow">{eyebrow}</p><h1>{ar ? "إتمام الطلب" : "Checkout"}</h1><div className="checkout-layout"><form className="checkout-form" action={submit}><h2>{ar ? "بيانات التواصل والتوصيل" : "Contact and delivery"}</h2><div className="pending-choice"><strong>{ar ? "التوصيل داخل سلطنة عُمان فقط" : "Delivery within Oman only"}</strong><p>{ar ? "توصيل مجاني · جميع الأسعار النهائية بالريال العُماني." : "Free delivery · all final prices are in OMR."}</p></div><div className="form-grid"><label>{ar ? "الاسم الكامل" : "Full name"}<input name="fullName" autoComplete="name" required /></label><label>{ar ? "البريد الإلكتروني" : "Email"}<input name="email" type="email" autoComplete="email" required /></label><label>{ar ? "رقم الهاتف" : "Phone"}<input name="phone" type="tel" autoComplete="tel" required /></label><label>{ar ? "الدولة" : "Country"}<input name="countryCode" value="OM" readOnly aria-label={ar ? "سلطنة عُمان" : "Oman"} /><small>{ar ? "سلطنة عُمان" : "Oman"}</small></label><label>{ar ? "المحافظة" : "Governorate"}<select name="governorate" value={governorate} onChange={(event) => { const value = event.target.value; setGovernorate(value); void refreshShipping(value); }} required><option value="">{ar ? "اختر المحافظة" : "Select governorate"}</option>{OMAN_GOVERNORATES.map((item) => <option key={item.value} value={item.value}>{ar ? item.ar : item.en}</option>)}</select></label><label>{ar ? "المدينة / الولاية" : "City / Wilayat"}<input name="city" required /></label><label className="full-field">{ar ? "العنوان بالتفصيل" : "Full address"}<textarea name="addressLine" rows={3} required /></label></div><div className="coupon-entry"><label>{ar ? "كود الخصم" : "Coupon code"}<input name="couponCode" value={coupon} onChange={(event) => setCoupon(event.target.value)} maxLength={60} dir="ltr" /></label><button className="secondary-button" type="button" onClick={() => void applyCoupon()} disabled={!coupon.trim()}>{ar ? "تطبيق" : "Apply"}</button></div>{couponMessage && <p className="coupon-message">{couponMessage}</p>}{quote?.shipping_available && <div className="pending-choice"><strong>{ar ? "التوصيل" : "Delivery"}</strong><p>{ar ? "توصيل مجاني" : "Free delivery"}{quote.estimated_days_min && quote.estimated_days_max ? ` · ${quote.estimated_days_min}-${quote.estimated_days_max} ${ar ? "أيام" : "days"}` : ""}</p></div>}<div className="pending-choice"><strong>{ar ? "طريقة الدفع" : "Payment method"}</strong><label style={{ display: "flex", alignItems: "center", gap: ".55rem", marginTop: ".65rem" }}><input type="radio" name="paymentMethod" value="cash_on_delivery" checked={paymentMethod === "cash_on_delivery"} disabled={Boolean(pendingPayment)} onChange={() => setPaymentMethod("cash_on_delivery")} />{ar ? "الدفع عند الاستلام" : "Cash on delivery"}</label>{tapEnabled && <label style={{ display: "flex", alignItems: "center", gap: ".55rem", marginTop: ".5rem" }}><input type="radio" name="paymentMethod" value="tap" checked={paymentMethod === "tap"} disabled={Boolean(pendingPayment)} onChange={() => setPaymentMethod("tap")} />{ar ? "الدفع الإلكتروني الآمن عبر Tap" : "Secure online payment via Tap"}</label>}<p>{paymentMethod === "cash_on_delivery" ? (ar ? "تدفع قيمة الطلب عند استلامه." : "Pay the order total when it is delivered.") : (ar ? "سيتم تحويلك إلى صفحة Tap الآمنة بعد تأكيد الطلب." : "You will be redirected to Tap's secure payment page after placing the order.")}</p></div>{error && <p className="form-error" role="alert">{error}</p>}<p className="checkout-legal">{ar ? "بإتمام الطلب، أنت توافق على" : "By placing the order, you agree to the"} <Link href={`/${locale}/terms`}>{ar ? "شروط الاستخدام" : "Terms of Use"}</Link> {ar ? "وتقر بالاطلاع على" : "and acknowledge the"} <Link href={`/${locale}/privacy`}>{ar ? "سياسة الخصوصية" : "Privacy Policy"}</Link> {ar ? "و" : "and"} <Link href={`/${locale}/returns`}>{ar ? "سياسة الاسترجاع والتبديل" : "Return & Exchange Policy"}</Link>.</p><button className="primary-button" disabled={busy || cart.length === 0}>{buttonText}</button></form><aside className="order-summary"><h2>{ar ? "طلبك" : "Your order"}</h2>{cart.map((line) => <div key={cartLineKey(line.product)}><span>{line.product.name[locale]}{line.product.variantTitle ? ` · ${line.product.variantTitle[locale]}` : ""} × {line.quantity}</span><strong>{formatPrice(line.product.price * line.quantity, locale)}</strong></div>)}<hr /><div><span>{ar ? "المجموع الفرعي" : "Subtotal"}</span><strong>{formatPrice(quote?.subtotal ?? subtotal, locale)}</strong></div>{quote && quote.discount_total > 0 && <div className="discount-line"><span>{ar ? `الخصم (${quote.promotion_code})` : `Discount (${quote.promotion_code})`}</span><strong>-{formatPrice(quote.discount_total, locale)}</strong></div>}<div><span>{ar ? "التوصيل" : "Delivery"}</span><strong>{ar ? "مجاني" : "Free"}</strong></div><hr /><div><span>{ar ? "الإجمالي" : "Total"}</span><strong>{formatPrice(quote?.grand_total ?? subtotal, locale)}</strong></div></aside></div></main>;
}
