"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type Tracking = { order_number: string; status: string; payment_status: string };

export function TrackOrderView({ locale, initialOrder }: { locale: Locale; initialOrder: string }) {
  const [result, setResult] = useState<Tracking | null>(null);
  const [error, setError] = useState("");
  const ar = locale === "ar";

  async function submit(formData: FormData) {
    const order = String(formData.get("order") || "").trim();
    const email = String(formData.get("email") || "").trim();
    setError(""); setResult(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const response = await fetch(`${base}/orders/${encodeURIComponent(order)}/track?email=${encodeURIComponent(email)}`);
      if (!response.ok) throw new Error("not_found");
      setResult(await response.json() as Tracking);
    } catch { setError(ar ? "لم نجد طلبًا مطابقًا لهذه البيانات." : "No order matched these details."); }
  }

  return <main className="content-page shell"><p className="eyebrow">ORDER TRACKING</p><h1>{ar ? "تتبع طلبك" : "Track your order"}</h1><form className="checkout-form tracking-form" action={submit}><div className="form-grid"><label>{ar ? "رقم الطلب" : "Order number"}<input name="order" defaultValue={initialOrder} required /></label><label>{ar ? "البريد المستخدم في الطلب" : "Order email"}<input name="email" type="email" required /></label></div><button className="primary-button">{ar ? "عرض حالة الطلب" : "View order status"}</button>{error && <p className="form-error" role="alert">{error}</p>}{result && <div className="tracking-result"><strong>{result.order_number}</strong><span>{ar ? "حالة الطلب" : "Order"}: {result.status}</span><span>{ar ? "حالة الدفع" : "Payment"}: {result.payment_status}</span></div>}</form></main>;
}

