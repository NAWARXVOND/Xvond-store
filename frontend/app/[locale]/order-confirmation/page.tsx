import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { isLocale } from "@/lib/i18n";
import type { StoreContext } from "@/lib/store-context";
import { appendStoreContext, storeHomePath } from "@/lib/store-context";

export default async function ConfirmationPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ order?: string; store?: string }> }) {
  const [{ locale }, { order, store: rawStore }] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  const store: StoreContext | null = rawStore === "lifestyle" || rawStore === "smart" ? rawStore : null;
  const ar = locale === "ar";
  const trackPath = `/${locale}/track-order${order ? `?order=${encodeURIComponent(order)}` : ""}`;
  const trackHref = appendStoreContext(trackPath, store);
  const continueHref = store ? storeHomePath(locale, store) : `/${locale}`;

  return (
    <main className="content-page shell confirmation">
      <CheckCircleIcon />
      <p className="eyebrow">ORDER RECEIVED</p>
      <h1>{ar ? "تم استلام طلبك" : "Your order is received"}</h1>
      <p>{ar ? "يمكنك متابعة حالة الطلب والدفع والتوصيل من صفحة التتبع." : "You can follow the order, payment and delivery status from order tracking."}</p>
      {order && <strong>{ar ? "رقم الطلب:" : "Order number:"} {order}</strong>}
      <div className="actions">
        <Link className="secondary-button" href={trackHref}>{ar ? "تتبع الطلب" : "Track order"}</Link>
        <Link className="secondary-button" href={continueHref}>{ar ? "متابعة التسوق" : "Continue shopping"}</Link>
      </div>
    </main>
  );
}
