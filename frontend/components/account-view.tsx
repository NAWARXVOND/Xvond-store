"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

type Profile = { id: string; full_name: string; email: string };
type Address = { id: string; label: string; governorate: string; city: string; address_line: string; postal_code?: string };
type Order = { order_number: string; status: string; payment_status: string; currency: string; grand_total: string; created_at: string };
const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function AccountView({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [register, setRegister] = useState(false);
  const [message, setMessage] = useState("");
  const request = useCallback(async (path: string, options?: RequestInit) => {
    const response = await fetch(`${apiUrl}${path}`, { ...options, credentials: "include", headers: { "Content-Type": "application/json", ...(options?.headers || {}) } });
    if (!response.ok) throw new Error(String(response.status));
    return response.status === 204 ? null : response.json();
  }, []);
  const load = useCallback(async () => {
    try {
      const me = await request("/account/me") as Profile;
      const [savedAddresses, savedOrders] = await Promise.all([request("/account/addresses"), request("/account/orders")]);
      setProfile(me); setAddresses(savedAddresses as Address[]); setOrders(savedOrders as Order[]);
    } catch { setProfile(null); }
  }, [request]);
  useEffect(() => { queueMicrotask(() => void load()); }, [load]);

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await request(register ? "/auth/register" : "/auth/login", { method: "POST", body: JSON.stringify(register ? { full_name: data.full_name, email: data.email, password: data.password } : { email: data.email, password: data.password }) });
      await load();
    } catch { setMessage(ar ? "تعذر الدخول. راجع البريد وكلمة المرور." : "Could not sign in. Check your email and password."); }
  }

  async function addAddress(form: FormData) {
    await request("/account/addresses", { method: "POST", body: JSON.stringify(Object.fromEntries(form)) });
    await load();
  }

  async function removeAddress(id: string) {
    await request(`/account/addresses/${id}`, { method: "DELETE" });
    await load();
  }

  async function logout() {
    await request("/auth/logout", { method: "POST" });
    setProfile(null); setAddresses([]); setOrders([]);
  }

  async function requestReturn(form: FormData) {
    setMessage("");
    try {
      await request("/account/returns", { method: "POST", body: JSON.stringify({ order_number: form.get("order_number"), reason: form.get("reason") }) });
      setMessage(ar ? "تم إرسال طلب الاسترجاع للمراجعة." : "Your return request was submitted for review.");
    } catch {
      setMessage(ar ? "تعذر إرسال الطلب. تأكد من رقم الطلب." : "Could not submit the request. Check the order number.");
    }
  }

  if (!profile) return <main className="content-page shell account-auth"><form onSubmit={(event) => void authenticate(event)}><p className="eyebrow">XVOND MEMBERS</p><h1>{register ? (ar ? "إنشاء حساب" : "Create account") : (ar ? "تسجيل الدخول" : "Sign in")}</h1>{register && <label>{ar ? "الاسم الكامل" : "Full name"}<input name="full_name" required minLength={2} /></label>}<label>{ar ? "البريد الإلكتروني" : "Email"}<input name="email" type="email" required /></label><label>{ar ? "كلمة المرور" : "Password"}<input name="password" type="password" required minLength={10} /></label>{message && <p className="form-error">{message}</p>}<button className="primary-button">{register ? (ar ? "إنشاء الحساب" : "Create account") : (ar ? "دخول" : "Sign in")}</button><button className="text-button" type="button" onClick={() => setRegister(!register)}>{register ? (ar ? "لديك حساب؟ سجل الدخول" : "Already registered? Sign in") : (ar ? "ليس لديك حساب؟ أنشئ حسابًا" : "New here? Create an account")}</button>{!register && <Link className="text-button" href={`/${locale}/account/reset`}>{ar ? "نسيت كلمة المرور؟" : "Forgot password?"}</Link>}</form></main>;

  return <main className="content-page shell account-page">
    <header><div><p className="eyebrow">XVOND MEMBERS</p><h1>{ar ? `أهلًا، ${profile.full_name}` : `Welcome, ${profile.full_name}`}</h1><p>{profile.email}</p>{message && <small>{message}</small>}</div><button className="secondary-button" onClick={() => void logout()}>{ar ? "تسجيل الخروج" : "Sign out"}</button></header>
    <section><h2>{ar ? "عناويني" : "My addresses"}</h2><form className="account-address-form" action={addAddress}><input name="label" placeholder={ar ? "اسم العنوان: المنزل" : "Label: Home"} defaultValue="home" required /><input name="governorate" placeholder={ar ? "المحافظة" : "Governorate"} required /><input name="city" placeholder={ar ? "المدينة" : "City"} required /><input name="address_line" placeholder={ar ? "العنوان بالتفصيل" : "Full address"} required /><input name="postal_code" placeholder={ar ? "الرمز البريدي (اختياري)" : "Postal code (optional)"} /><button className="primary-button">{ar ? "حفظ العنوان" : "Save address"}</button></form><div className="account-cards">{addresses.map((address) => <article key={address.id}><strong>{address.label}</strong><p>{address.governorate} — {address.city}</p><small>{address.address_line}</small><button className="danger-link" onClick={() => void removeAddress(address.id)}>{ar ? "حذف" : "Remove"}</button></article>)}</div></section>
    <section><h2>{ar ? "طلباتي" : "My orders"}</h2><div className="account-orders">{orders.length ? orders.map((order) => <article key={order.order_number}><div><strong>{order.order_number}</strong><small>{new Date(order.created_at).toLocaleDateString(ar ? "ar-OM" : "en-OM")}</small></div><span>{order.grand_total} {order.currency}</span><span>{order.status}</span><Link href={`/${locale}/track-order?order=${order.order_number}`}>{ar ? "تتبع" : "Track"}</Link></article>) : <div className="empty-card"><p>{ar ? "لا توجد طلبات بعد." : "No orders yet."}</p></div>}</div></section>
    <section><h2>{ar ? "طلب استرجاع" : "Request a return"}</h2><form className="return-form" action={requestReturn}><input name="order_number" placeholder={ar ? "رقم الطلب" : "Order number"} required /><textarea name="reason" minLength={5} maxLength={2000} placeholder={ar ? "سبب طلب الاسترجاع" : "Reason for the return request"} required /><button className="primary-button">{ar ? "إرسال للمراجعة" : "Submit for review"}</button></form></section>
  </main>;
}
