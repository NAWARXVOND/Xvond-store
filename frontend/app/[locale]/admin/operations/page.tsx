import { notFound } from "next/navigation";
import { AdminOperations } from "@/components/admin-operations";
import { isLocale } from "@/lib/i18n";

export default async function AdminOperationsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <AdminOperations locale={locale} />;
}
