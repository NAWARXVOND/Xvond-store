"use client";

import { useState } from "react";
import type { Locale } from "@/lib/i18n";

type Tracking = { order_number: string; status: string; payment_status: string };
type ShipmentEvent = { event_code: string; label_ar: string; label_en: string; location?: string | null; occurred_at: string };
type Shipment = { provider: string; tracking_number?: string | null; tracking_url?: string | null; status: string; cod_status?: string | null; events: ShipmentEvent[] };
type ShipmentTracking = { order_number: string; order_status: string; shipment: Shipment | null };

export function TrackOrderView({ locale, initialOrder }: { locale: Locale; initialOrder: string }) {
  const [result, setResult] = useState<Tracking | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [error, setError] = useState("");
  const ar = locale === "ar";

  async function submit(formData: FormData) {
    const order = String(formData.get("order") || "").trim();
    const email = String(formData.get("email") || "").trim();
    setError(""); setResult(null); setShipment(null);
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const query = `email=${encodeURIComponent(email)}`;
      const [orderResponse, shipmentResponse] = await Promise.all([
        fetch(`${base}/orders/${encodeURIComponent(order)}/track?${query}`),
        fetch(`${base}/orders/${encodeURIComponent(order)}/shipment?${query}`),
      ]);
      if (!orderResponse.ok) throw new Error("not_found");
      setResult(await orderResponse.json() as Tracking);
      if (shipmentResponse.ok) {
        const value = await shipmentResponse.json() as ShipmentTracking;
        setShipment(value.shipment);
      }
    } catch { setError(ar ? "لم نجد طلبًا مطابقًا لهذه البيانات." : "No order matched these details."); }
  }

  return <main className="content-page shell"><p className="eyebrow">ORDER TRACKING</p><h1>{ar ? "تتبع طلبك" : "Track your order"}</h1><form className="checkout-form tracking-form" action={submit}><div className="form-grid"><label>{ar ? "رقم الطلب" : "Order number"}<input name="order" defaultValue={initialOrder} required /></label><label>{ar ? "البريد المستخدم في الطلب" : "Order email"}<input name="email" type="email" required /></label></div><button className="primary-button">{ar ? "عرض حالة الطلب" : "View order status"}</button>{error && <p className="form-error" role="alert">{error}</p>}{result && <div className="tracking-result"><strong>{result.order_number}</strong><span>{ar ? "حالة الطلب" : "Order"}: {result.status}</span><span>{ar ? "حالة الدفع" : "Payment"}: {result.payment_status}</span>{shipment ? <><span>{ar ? "شركة التوصيل" : "Courier"}: {shipment.provider}</span><span>{ar ? "حالة الشحنة" : "Shipment"}: {shipment.status}</span>{shipment.tracking_number && <span>{ar ? "رقم التتبع" : "Tracking number"}: {shipment.tracking_number}</span>}{shipment.tracking_url && <a href={shipment.tracking_url} target="_blank" rel="noreferrer">{ar ? "فتح تتبع شركة التوصيل" : "Open courier tracking"}</a>}<div>{shipment.events.map((event) => <p key={`${event.event_code}-${event.occurred_at}`}><strong>{ar ? event.label_ar : event.label_en}</strong> · {new Date(event.occurred_at).toLocaleString(ar ? "ar-OM" : "en-OM")}{event.location ? ` · ${event.location}` : ""}</p>)}</div></> : <span>{ar ? "لم يتم تسليم الطلب لشركة التوصيل بعد." : "The order has not been handed to a courier yet."}</span>}</div>}</form></main>;
}
