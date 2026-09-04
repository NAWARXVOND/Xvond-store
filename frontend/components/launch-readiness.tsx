"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Check = { key: string; ready: boolean; detail: string };
type Readiness = { ready: boolean; ready_count: number; total_checks: number; checks: Check[] };

const labels: Record<string, { ar: string; en: string }> = {
  catalog: { ar: "المنتجات والمخزون", en: "Catalog & inventory" },
  market: { ar: "سوق الإطلاق", en: "Launch market" },
  shipping: { ar: "مناطق التوصيل", en: "Delivery areas" },
  data_residency: { ar: "موقع قاعدة البيانات", en: "Database residency" },
  email: { ar: "البريد الإلكتروني", en: "Email delivery" },
  payment: { ar: "طرق الدفع", en: "Payment methods" },
  production: { ar: "بيئة الإنتاج وHTTPS", en: "Production & HTTPS" },
};

export function LaunchReadiness({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const [data, setData] = useState<Readiness | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    queueMicrotask(() => {
      void fetch(`${apiUrl}/admin/launch-readiness`, { credentials: "include" })
        .then(async (response) => {
          if (response.status === 401) { setAuthorized(false); return; }
          if (!response.ok) throw new Error("readiness_failed");
          setAuthorized(true);
          setData(await response.json() as Readiness);
        })
        .catch(() => setError(ar ? "تعذر فحص جاهزية المتجر." : "Could not check store readiness."));
    });
  }, [ar]);

  if (authorized === false) return <main className="content-page shell"><h1>{ar ? "جاهزية الإطلاق" : "Launch readiness"}</h1><p>{ar ? "سجل دخول الإدارة أولًا." : "Sign in to admin first."}</p><Link className="primary-button" href={`/${locale}/admin`}>{ar ? "دخول الإدارة" : "Admin sign in"}</Link></main>;

  return <main className="content-page shell commerce-page"><p className="eyebrow">XVOND STORE ADMIN</p><h1>{ar ? "جاهزية إطلاق المتجر" : "Store launch readiness"}</h1><p>{ar ? "فحص مباشر للإعدادات الأساسية المطلوبة قبل استقبال طلبات حقيقية داخل سلطنة عُمان." : "Live checks for the core configuration required before accepting real orders in Oman."}</p><div className="admin-actions"><Link className="secondary-button" href={`/${locale}/admin`}>{ar ? "لوحة الإدارة" : "Admin dashboard"}</Link><Link className="secondary-button" href={`/${locale}/admin/shipping`}>{ar ? "إدارة مناطق التوصيل" : "Delivery management"}</Link></div>{error && <p className="form-error">{error}</p>}{!data && !error && <p>{ar ? "جارٍ الفحص…" : "Checking…"}</p>}{data && <><div className="pending-choice"><strong>{data.ready ? (ar ? "المتجر جاهز من ناحية الإعدادات التقنية" : "Technical launch checks are ready") : (ar ? "يوجد إعدادات ناقصة قبل الإطلاق" : "Some launch configuration is still missing")}</strong><p>{data.ready_count}/{data.total_checks} {ar ? "بنود جاهزة" : "checks ready"}</p></div><div className="admin-cards">{data.checks.map((check) => <article key={check.key}><div><strong>{labels[check.key]?.[ar ? "ar" : "en"] || check.key}</strong><small>{check.detail}</small></div><strong>{check.ready ? "✓" : "—"}</strong></article>)}</div></>}</main>;
}
