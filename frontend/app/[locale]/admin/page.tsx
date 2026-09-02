import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";

const modules = [
  ["Products", "128"], ["Categories", "5"], ["Inventory", "94%"], ["Orders", "24"],
  ["Customers", "412"], ["Coupons", "8"], ["Shipping", "Setup"], ["Store settings", "Ready"]
];

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <main className="content-page shell">
      <p className="eyebrow">XVOND STORE ADMIN</p><h1>{locale === "ar" ? "لوحة المتجر" : "Store dashboard"}</h1>
      <div className="admin-grid">{modules.map(([name, value]) => <article className="admin-card" key={name}><span>{name}</span><strong>{value}</strong></article>)}</div>
    </main>
  );
}

