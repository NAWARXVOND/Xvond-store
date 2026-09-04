"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Order = {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_country_code: string;
  shipping_governorate: string | null;
  shipping_city: string | null;
  shipping_address_line: string | null;
  status: string;
  payment_status: string;
  payment_method: string;
  currency: string;
  subtotal: string;
  discount_total: string;
  shipping_total: string;
  tax_total: string;
  grand_total: string;
  promotion_code: string | null;
  created_at: string;
};

const orderStates = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
const paymentStates = ["pending", "authorized", "paid", "failed", "refunded"];

export function OrderFulfillmentAdmin({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const [orders, setOrders] = useState<Order[]>([]);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const me = await fetch(`${apiUrl}/auth/admin/me`, { credentials: "include" });
    if (!me.ok) { setAuthorized(false); return; }
    setAuthorized(true);
    const response = await fetch(`${apiUrl}/admin/orders`, { credentials: "include", cache: "no-store" });
    if (!response.ok) { setMessage(ar ? "تعذر تحميل الطلبات." : "Could not load orders."); return; }
    setOrders(await response.json() as Order[]);
  }, [ar]);

  useEffect(() => { queueMicrotask(() => void load()); }, [load]);

  async function update(id: string, body: Record<string, string>) {
    setBusyId(id); setMessage("");
    const response = await fetch(`${apiUrl}/admin/orders/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusyId(null);
    if (!response.ok) { setMessage(ar ? "تعذر تحديث الطلب." : "Could not update order."); return; }
    await load();
  }

  if (authorized === null) return <main className="content-page shell"><p>{ar ? "جارٍ التحميل…" : "Loading…"}</p></main>;
  if (!authorized) return <main className="content-page shell"><h1>{ar ? "إدارة الطلبات" : "Order management"}</h1><p>{ar ? "سجل دخول الإدارة أولًا." : "Sign in to admin first."}</p><Link className="primary-button" href={`/${locale}/admin`}>{ar ? "دخول الإدارة" : "Admin sign in"}</Link></main>;

  return <main className="content-page shell commerce-page">
    <p className="eyebrow">XVOND STORE ADMIN</p>
    <h1>{ar ? "الطلبات والتجهيز" : "Orders & fulfillment"}</h1>
    <p><Link href={`/${locale}/admin`}>← {ar ? "العودة للوحة الإدارة" : "Back to admin"}</Link></p>
    {message && <p className="admin-message">{message}</p>}
    <div className="admin-cards">
      {orders.length ? orders.map((order) => <article key={order.id} style={{ alignItems: "stretch", gap: "1rem" }}>
        <div style={{ display: "grid", gap: ".35rem" }}>
          <strong>{order.order_number}</strong>
          <small>{new Date(order.created_at).toLocaleString(ar ? "ar-OM" : "en-OM")}</small>
          <span>{order.customer_name || "—"}</span>
          <small>{order.customer_email || "—"}{order.customer_phone ? ` · ${order.customer_phone}` : ""}</small>
          <small>{[order.shipping_governorate, order.shipping_city, order.shipping_address_line].filter(Boolean).join(" · ") || (ar ? "طلب قديم بدون لقطة عنوان" : "Legacy order without address snapshot")}</small>
        </div>
        <div style={{ display: "grid", gap: ".35rem" }}>
          <strong>{order.grand_total} {order.currency}</strong>
          <small>{ar ? "الشحن" : "Shipping"}: {order.shipping_total} {order.currency}{order.discount_total !== "0.000" ? ` · ${ar ? "خصم" : "Discount"}: ${order.discount_total}` : ""}</small>
          <small>{ar ? "طريقة الدفع" : "Payment method"}: {order.payment_method === "cash_on_delivery" ? (ar ? "الدفع عند الاستلام" : "Cash on delivery") : order.payment_method === "tap" ? "Tap" : order.payment_method}</small>
          <select value={order.status} disabled={busyId === order.id} onChange={(event) => void update(order.id, { status: event.target.value })}>
            {orderStates.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
          <select value={order.payment_status} disabled={busyId === order.id} onChange={(event) => void update(order.id, { payment_status: event.target.value })}>
            {paymentStates.map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>
      </article>) : <article><p>{ar ? "لا توجد طلبات بعد." : "No orders yet."}</p></article>}
    </div>
  </main>;
}
