import { notFound } from "next/navigation";
import { PasswordRecovery } from "@/components/password-recovery";
import { isLocale } from "@/lib/i18n";

export default async function ResetPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ token?: string; purpose?: string }> }) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocale(locale)) notFound();
  return <PasswordRecovery locale={locale} token={query.token} purpose={query.purpose} />;
}
