import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { isLocale } from "@/lib/i18n";

export default async function ConfirmationPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ order?: string }> }) {
  const [{ locale }, { order }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  return <main className="content-page shell confirmation"><CheckCircleIcon /><p className="eyebrow">ORDER RECEIVED</p><h1>{ar ? "تم استلام طلبك المبدئي" : "Your pending order is received"}</h1><p>{ar ? "لم يتم تحصيل أي مبلغ. سنتابع حالة الدفع والتوصيل بعد اعتماد الخيارات." : "No payment was collected. Payment and delivery will follow once options are approved."}</p>{order && <strong>{ar ? "رقم الطلب:" : "Order number:"} {order}</strong>}<Link className="secondary-button" href={`/${locale}/track-order${order ? `?order=${encodeURIComponent(order)}` : ""}`}>{ar ? "تتبع الطلب" : "Track order"}</Link></main>;
}

