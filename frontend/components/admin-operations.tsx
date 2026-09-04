"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Check = { key: string; ready: boolean; detail: string };
type Readiness = { ready: boolean; ready_count: number; total_checks: number; checks: Check[] };
type Category = { id: string; slug: string; name_ar: string; name_en: string };
type Variant = { id: string; sku: string; price: string; compare_at_price: string | null; stock_quantity: number };
type Product = {
  id: string;
  slug: string;
  sku: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  primary_image_url: string | null;
  category_id: string;
  category: Category;
  variants: Variant[];
  is_active: boolean;
};

export function AdminOperations({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [readiness, setReadiness] = useState<Readiness | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const adminFetch = useCallback(async (path: string, options?: RequestInit) => {
    const response = await fetch(`${apiUrl}${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    });
    if (response.status === 401) {
      setAuthorized(false);
      throw new Error("unauthorized");
    }
    if (!response.ok) throw new Error(await response.text());
    return response.status === 204 ? null : response.json();
  }, []);

  const load = useCallback(async () => {
    try {
      const me = await fetch(`${apiUrl}/auth/admin/me`, { credentials: "include" });
      if (!me.ok) { setAuthorized(false); return; }
      setAuthorized(true);
      const [ready, productList, categoryList] = await Promise.all([
        adminFetch("/admin/launch-readiness"),
        adminFetch("/admin/products"),
        adminFetch("/admin/categories"),
      ]);
      setReadiness(ready as Readiness);
      setProducts(productList as Product[]);
      setCategories(categoryList as Category[]);
    } catch (error) {
      if ((error as Error).message !== "unauthorized") setMessage(ar ? "تعذر تحميل بيانات التشغيل." : "Could not load operations data.");
    }
  }, [adminFetch, ar]);

  useEffect(() => { queueMicrotask(() => void load()); }, [load]);

  async function saveProduct(product: Product, form: FormData) {
    setBusyId(product.id); setMessage("");
    try {
      const image = String(form.get("primary_image_url") || "").trim();
      await adminFetch(`/admin/products/${product.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name_ar: String(form.get("name_ar")),
          name_en: String(form.get("name_en")),
          description_ar: String(form.get("description_ar") || "") || null,
          description_en: String(form.get("description_en") || "") || null,
          primary_image_url: image || null,
          category_id: String(form.get("category_id")),
          is_active: form.get("is_active") === "on",
        }),
      });
      const variant = product.variants[0];
      if (variant) {
        const compareValue = String(form.get("compare_at_price") || "").trim();
        await adminFetch(`/admin/variants/${variant.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            price: Number(form.get("price")),
            compare_at_price: compareValue ? Number(compareValue) : null,
            stock_quantity: Number(form.get("stock_quantity")),
          }),
        });
      }
      setMessage(ar ? "تم تحديث المنتج فعليًا." : "Product updated.");
      await load();
    } catch {
      setMessage(ar ? "فشل تحديث المنتج. راجع القيم." : "Product update failed. Check the values.");
    } finally { setBusyId(null); }
  }

  async function refreshReadiness() {
    setMessage("");
    try {
      setReadiness(await adminFetch("/admin/launch-readiness") as Readiness);
    } catch { setMessage(ar ? "تعذر فحص الجاهزية." : "Could not refresh readiness."); }
  }

  if (authorized === null) return <main className="content-page shell"><p>{ar ? "جارٍ التحميل…" : "Loading…"}</p></main>;
  if (!authorized) return <main className="content-page shell"><h1>{ar ? "تشغيل المتجر" : "Store operations"}</h1><p>{ar ? "سجل دخول الإدارة أولًا." : "Sign in to admin first."}</p><Link className="primary-button" href={`/${locale}/admin`}>{ar ? "دخول الإدارة" : "Admin sign in"}</Link></main>;

  return <main className="content-page shell commerce-page">
    <p className="eyebrow">XVOND STORE ADMIN</p>
    <h1>{ar ? "تشغيل المتجر" : "Store operations"}</h1>
    <p><Link href={`/${locale}/admin`}>← {ar ? "لوحة التحكم" : "Control center"}</Link></p>
    {message && <p className="admin-message">{message}</p>}

    <section style={{ marginBlock: "2rem" }}>
      <div className="section-heading"><div><p>LAUNCH</p><h2>{ar ? "جاهزية الإطلاق" : "Launch readiness"}</h2></div><button className="secondary-button" onClick={() => void refreshReadiness()}>{ar ? "إعادة الفحص" : "Refresh"}</button></div>
      {readiness && <><div className="admin-kpis"><article><span>{ar ? "الجاهز" : "Ready"}</span><strong>{readiness.ready_count}/{readiness.total_checks}</strong></article><article><span>{ar ? "الحالة" : "Status"}</span><strong>{readiness.ready ? (ar ? "جاهز" : "Ready") : (ar ? "غير جاهز" : "Not ready")}</strong></article></div><div className="admin-cards">{readiness.checks.map((check) => <article key={check.key}><div><strong>{check.key}</strong><small>{check.detail}</small></div><span>{check.ready ? "✓" : "—"}</span></article>)}</div></>}
      <div style={{ display: "flex", gap: ".75rem", flexWrap: "wrap", marginTop: "1rem" }}><Link className="secondary-button" href={`/${locale}/admin/shipping`}>{ar ? "إدارة الشحن" : "Shipping"}</Link><Link className="secondary-button" href={`/${locale}/admin/readiness`}>{ar ? "تفاصيل الجاهزية" : "Readiness details"}</Link></div>
    </section>

    <section style={{ marginTop: "3rem" }}>
      <div className="section-heading"><div><p>CATALOG OPS</p><h2>{ar ? "المنتجات الفعلية" : "Live catalog operations"}</h2></div></div>
      <div style={{ display: "grid", gap: "1rem" }}>
        {products.map((product) => {
          const variant = product.variants[0];
          return <form key={product.id} action={async (form) => saveProduct(product, form)} className="checkout-form" style={{ opacity: busyId === product.id ? .65 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center" }}><div><strong>{ar ? product.name_ar : product.name_en}</strong><small style={{ display: "block" }}>{product.sku} · {product.category.slug}</small></div><label style={{ display: "flex", alignItems: "center", gap: ".45rem" }}><input name="is_active" type="checkbox" defaultChecked={product.is_active} />{ar ? "ظاهر للبيع" : "Active"}</label></div>
            <div className="form-grid">
              <input name="name_ar" defaultValue={product.name_ar} placeholder="اسم عربي" required />
              <input name="name_en" defaultValue={product.name_en} placeholder="English name" required />
              <select name="category_id" defaultValue={product.category_id}>{categories.map((category) => <option value={category.id} key={category.id}>{ar ? category.name_ar : category.name_en}</option>)}</select>
              <input name="price" type="number" min="0.001" step="0.001" defaultValue={variant?.price || ""} placeholder={ar ? "السعر" : "Price"} required={Boolean(variant)} />
              <input name="compare_at_price" type="number" min="0.001" step="0.001" defaultValue={variant?.compare_at_price || ""} placeholder={ar ? "السعر السابق" : "Compare price"} />
              <input name="stock_quantity" type="number" min="0" defaultValue={variant?.stock_quantity ?? 0} placeholder={ar ? "المخزون" : "Stock"} required={Boolean(variant)} />
              <input className="full-field" name="primary_image_url" type="url" defaultValue={product.primary_image_url || ""} placeholder={ar ? "رابط صورة المنتج" : "Product image URL"} />
              <textarea name="description_ar" defaultValue={product.description_ar || ""} placeholder="وصف عربي" />
              <textarea name="description_en" defaultValue={product.description_en || ""} placeholder="English description" />
            </div>
            <button className="primary-button" disabled={busyId === product.id}>{busyId === product.id ? (ar ? "جارٍ الحفظ…" : "Saving…") : (ar ? "حفظ المنتج" : "Save product")}</button>
          </form>;
        })}
        {!products.length && <div className="empty-card"><p>{ar ? "لا توجد منتجات فعلية بعد. أضف المنتجات من لوحة التحكم أولًا." : "No live products yet. Add products from the control center first."}</p></div>}
      </div>
    </section>
  </main>;
}
