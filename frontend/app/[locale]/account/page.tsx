import { notFound } from "next/navigation";
import { AccountView } from "@/components/account-view";
import { ProfileDetailsCard } from "@/components/profile-details";
import { isLocale } from "@/lib/i18n";

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <>
    <ProfileDetailsCard locale={locale} />
    <AccountView locale={locale} />
  </>;
}
