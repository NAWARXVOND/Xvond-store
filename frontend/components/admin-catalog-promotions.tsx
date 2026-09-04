"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Category = {
  id: string;
  slug: string;
  name_ar: string;
  name_en: string;
  description_ar: string | null;
  description_en: string | null;
  is_active: boolean;
};

type Product = {
  id: string;
  sku: string;
  name_ar: string;
  name_en: string;
  is_active: boolean;
  variants: { id: string; price: string; stock_quantity: number }[];
};

type Coupon = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  value: string;
  minimum_order_amount: string | null;
  usage_limit: number | null;
  usage_count: number;
  is_active: boolean;
};

type Discount = {
  id: string;
  name: string;
  discount_type: "percentage" | "fixed";
  value: string;
  scope: "store" | "category" | "product";
  scope_reference: string | null;
  is_active: boolean;
};

export function AdminCatalogPromotions({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const adminFetch = useCallback(async (path: string, options?: RequestInit) => {
    const response = await fetch(`${apiUrl}/admin${path}`, {
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
      const [categoryList, productList, couponList, discountList] = await Promise.all([
        adminFetch("/categories"),
        adminFetch("/products"),
        adminFetch("/coupons"),
        adminFetch("/discounts"),
      ]);
      setCategories(categoryList as Category[]);
      setProducts(productList as Product[]);
      setCoupons(couponList as Coupon[]);
      setDiscounts(discountList as Discount[]);
    } catch (error) {
      if ((error as Error).message !== "unauthorized") {
        setMessage(ar ? "تعذر تحميل بيانات المتجر." : "Could not load store data.");
      }
    }
  }, [adminFetch, ar]);

  useEffect(() => { queueMicrotask(() => void load()); }, [load]);

  async function run(action: () => Promise<void>, success: string) {
    setBusy(true); setMessage("");
    try {
      await action();
      setMessage(success);
      await load();
    } catch {
      setMessage(ar ? "تعذر الحفظ. راجع البيانات." : "Could not save. Check the data.");
    } finally { setBusy(false); }
  }

  async function createCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    await run(async () => {
      await adminFetch("/categories", { method: "POST", body: JSON.stringify(values) });
      form.reset();
    }, ar ? "تمت إضافة القسم." : "Category added.");
  }

  async function createProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    const body = {
      slug: String(values.slug),
      sku: String(values.sku),
      name_ar: String(values.name_ar),
      name_en: String(values.name_en),
      description_ar: String(values.description_ar || "") || null,
      description_en: String(values.description_en || "") || null,
      primary_image_url: String(values.primary_image_url || "") || null,
      category_id: String(values.category_id),
      variant: {
        sku: String(values.sku),
        title_ar: "أساسي",
        title_en: "Default",
        price: Number(values.price),
        compare_at_price: values.compare_at_price ? Number(values.compare_at_price) : null,
        stock_quantity: Number(values.stock_quantity),
      },
    };
    await run(async () => {
      await adminFetch("/products", { method: "POST", body: JSON.stringify(body) });
      form.reset();
    }, ar ? "تمت إضافة المنتج." : "Product added.");
  }

  async function createCoupon(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    await run(async () => {
      await adminFetch("/coupons", {
        method: "POST",
        body: JSON.stringify({
          code: String(values.code),
          discount_type: String(values.discount_type),
          value: Number(values.value),
          minimum_order_amount: values.minimum_order_amount ? Number(values.minimum_order_amount) : null,
          usage_limit: values.usage_limit ? Number(values.usage_limit) : null,
          is_active: true,
        }),
      });
      form.reset();
    }, ar ? "تمت إضافة الكوبون." : "Coupon added.");
  }

  async function createDiscount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    await run(async () => {
      await adminFetch("/discounts", {
        method: "POST",
        body: JSON.stringify({
          name: String(values.name),
          discount_type: String(values.discount_type),
          value: Number(values.value),
          scope: String(values.scope),
          scope_reference: String(values.scope_reference || "") || null,
          is_active: true,
        }),
      });
      form.reset();
    }, ar ? "تمت إضافة الخصم." : "Discount added.");
  }

  if (authorized === null) return <main className="content-page shell"><p>{ar ? "جارٍ التحميل…" : "Loading…"}</p></main>;
  if (!authorized) return <main className="content-page shell"><h1>{ar ? "إدارة المتجر" : "Store management"}</h1><p>{ar ? "سجل دخول الإدارة أولًا." : "Sign in to admin first."}</p><Link className="primary-button" href={`/${locale}/admin`}>{ar ? "دخول الإدارة" : "Admin sign in"}</Link></main>;

  return <main className="content-page shell commerce-page">
    <p className="eyebrow">XVOND STORE ADMIN</p>
    <h1>{ar ? "إدارة المتجر" : "Store management"}</h1>
    <p><Link href={`/${locale}/admin`}>← {ar ? "لوحة التحكم" : "Control center"}</Link></p>
    {message && <p className="admin-message">{message}</p>}

    <section style={{ marginTop: "2rem" }}>
      <div className="section-heading"><div><p>CATALOG</p><h2>{ar ? "الأقسام" : "Categories"}</h2></div></div>
      <form className="checkout-form" onSubmit={(event) => void createCategory(event)}>
        <div className="form-grid"><input name="name_ar" placeholder="اسم القسم بالعربي" required /><input name="name_en" placeholder="Category name" required /><input name="slug" placeholder="category-slug" dir="ltr" required /><textarea name="description_ar" placeholder="وصف عربي (اختياري)" /><textarea name="description_en" placeholder="English description (optional)" /></div>
        <button className="primary-button" disabled={busy}>{ar ? "إضافة قسم" : "Add category"}</button>
      </form>
      <div className="admin-cards" style={{ marginTop: "1rem" }}>{categories.map((category) => <form key={category.id} action={async (form) => run(async () => {
        await adminFetch(`/categories/${category.id}`, { method: "PATCH", body: JSON.stringify({ name_ar: String(form.get("name_ar")), name_en: String(form.get("name_en")), slug: String(form.get("slug")), is_active: form.get("is_active") === "on" }) });
      }, ar ? "تم تحديث القسم." : "Category updated.")}><div style={{ display: "grid", gap: ".5rem", width: "100%" }}><input name="name_ar" defaultValue={category.name_ar} required /><input name="name_en" defaultValue={category.name_en} required /><input name="slug" defaultValue={category.slug} dir="ltr" required /><label><input name="is_active" type="checkbox" defaultChecked={category.is_active} /> {ar ? "ظاهر" : "Active"}</label><button className="table-button">{ar ? "حفظ" : "Save"}</button></div></form>)}</div>
    </section>

    <section style={{ marginTop: "3rem" }}>
      <div className="section-heading"><div><p>PRODUCTS</p><h2>{ar ? "المنتجات" : "Products"}</h2></div><Link className="secondary-button" href={`/${locale}/admin/operations`}>{ar ? "تعديل المنتجات الحالية" : "Edit existing products"}</Link></div>
      <form className="checkout-form" onSubmit={(event) => void createProduct(event)}>
        <div className="form-grid"><input name="name_ar" placeholder="اسم المنتج بالعربي" required /><input name="name_en" placeholder="Product name" required /><input name="slug" placeholder="product-url-slug" dir="ltr" required /><input name="sku" placeholder="SKU" dir="ltr" required /><select name="category_id" required><option value="">{ar ? "اختر القسم" : "Choose category"}</option>{categories.filter((item) => item.is_active).map((item) => <option key={item.id} value={item.id}>{ar ? item.name_ar : item.name_en}</option>)}</select><input name="price" type="number" step="0.001" min="0.001" placeholder={ar ? "السعر OMR" : "Price OMR"} required /><input name="compare_at_price" type="number" step="0.001" min="0.001" placeholder={ar ? "السعر السابق" : "Compare price"} /><input name="stock_quantity" type="number" min="0" placeholder={ar ? "المخزون" : "Stock"} required /><input className="full-field" name="primary_image_url" type="url" placeholder={ar ? "رابط صورة المنتج" : "Product image URL"} /><textarea name="description_ar" placeholder="وصف عربي" /><textarea name="description_en" placeholder="English description" /></div>
        <button className="primary-button" disabled={busy}>{ar ? "إضافة منتج" : "Add product"}</button>
      </form>
      <div className="admin-kpis" style={{ marginTop: "1rem" }}><article><span>{ar ? "إجمالي المنتجات" : "Products"}</span><strong>{products.length}</strong></article><article><span>{ar ? "المنتجات الظاهرة" : "Active"}</span><strong>{products.filter((item) => item.is_active).length}</strong></article><article><span>{ar ? "مخزون منخفض" : "Low stock"}</span><strong>{products.filter((item) => (item.variants[0]?.stock_quantity ?? 0) <= 5).length}</strong></article></div>
    </section>

    <section style={{ marginTop: "3rem" }}>
      <div className="section-heading"><div><p>PROMOTIONS</p><h2>{ar ? "الكوبونات" : "Coupons"}</h2></div></div>
      <form className="checkout-form" onSubmit={(event) => void createCoupon(event)}><div className="form-grid"><input name="code" placeholder="WELCOME10" dir="ltr" required /><select name="discount_type"><option value="percentage">{ar ? "نسبة %" : "Percentage"}</option><option value="fixed">{ar ? "مبلغ ثابت" : "Fixed amount"}</option></select><input name="value" type="number" step="0.001" min="0.001" placeholder={ar ? "قيمة الخصم" : "Value"} required /><input name="minimum_order_amount" type="number" step="0.001" min="0" placeholder={ar ? "حد أدنى للطلب" : "Minimum order"} /><input name="usage_limit" type="number" min="1" placeholder={ar ? "عدد الاستخدامات" : "Usage limit"} /></div><button className="primary-button" disabled={busy}>{ar ? "إضافة كوبون" : "Add coupon"}</button></form>
      <div className="admin-cards" style={{ marginTop: "1rem" }}>{coupons.map((coupon) => <article key={coupon.id}><div><strong>{coupon.code}</strong><small>{coupon.value} {coupon.discount_type === "percentage" ? "%" : "OMR"} · {coupon.usage_count}/{coupon.usage_limit ?? "∞"}</small></div><div style={{ display: "flex", gap: ".5rem" }}><button className="table-button" onClick={() => void run(async () => { await adminFetch(`/coupons/${coupon.id}`, { method: "PATCH", body: JSON.stringify({ is_active: !coupon.is_active }) }); }, ar ? "تم تحديث الكوبون." : "Coupon updated.")}>{coupon.is_active ? (ar ? "إيقاف" : "Disable") : (ar ? "تفعيل" : "Enable")}</button><button className="danger-link" onClick={() => void run(async () => { await adminFetch(`/coupons/${coupon.id}`, { method: "DELETE" }); }, ar ? "تم حذف الكوبون." : "Coupon deleted.")}>{ar ? "حذف" : "Delete"}</button></div></article>)}</div>
    </section>

    <section style={{ marginTop: "3rem", marginBottom: "3rem" }}>
      <div className="section-heading"><div><p>DISCOUNTS</p><h2>{ar ? "الخصومات التلقائية" : "Automatic discounts"}</h2></div></div>
      <form className="checkout-form" onSubmit={(event) => void createDiscount(event)}><div className="form-grid"><input name="name" placeholder={ar ? "اسم الخصم" : "Discount name"} required /><select name="discount_type"><option value="percentage">{ar ? "نسبة %" : "Percentage"}</option><option value="fixed">{ar ? "مبلغ ثابت" : "Fixed amount"}</option></select><input name="value" type="number" step="0.001" min="0.001" placeholder={ar ? "قيمة الخصم" : "Value"} required /><select name="scope"><option value="store">{ar ? "كل المتجر" : "Whole store"}</option><option value="category">{ar ? "قسم" : "Category"}</option><option value="product">{ar ? "منتج" : "Product"}</option></select><input name="scope_reference" placeholder={ar ? "Slug للقسم/المنتج عند الحاجة" : "Category/product slug when needed"} /></div><button className="primary-button" disabled={busy}>{ar ? "إضافة خصم" : "Add discount"}</button></form>
      <div className="admin-cards" style={{ marginTop: "1rem" }}>{discounts.map((discount) => <article key={discount.id}><div><strong>{discount.name}</strong><small>{discount.value} {discount.discount_type === "percentage" ? "%" : "OMR"} · {discount.scope}{discount.scope_reference ? ` / ${discount.scope_reference}` : ""}</small></div><div style={{ display: "flex", gap: ".5rem" }}><button className="table-button" onClick={() => void run(async () => { await adminFetch(`/discounts/${discount.id}`, { method: "PATCH", body: JSON.stringify({ is_active: !discount.is_active }) }); }, ar ? "تم تحديث الخصم." : "Discount updated.")}>{discount.is_active ? (ar ? "إيقاف" : "Disable") : (ar ? "تفعيل" : "Enable")}</button><button className="danger-link" onClick={() => void run(async () => { await adminFetch(`/discounts/${discount.id}`, { method: "DELETE" }); }, ar ? "تم حذف الخصم." : "Discount deleted.")}>{ar ? "حذف" : "Delete"}</button></div></article>)}</div>
    </section>
  </main>;
}
