import { notFound } from "next/navigation";
import { direction, isLocale, locales } from "@/lib/i18n";
import { StoreHeader } from "@/components/store-header";
import { StoreFooter } from "@/components/store-footer";
import { absoluteUrl } from "@/lib/urls";
import { CommerceProvider } from "@/components/commerce-provider";

export function generateStaticParams() { return locales.map((locale) => ({ locale })); }

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const organization = {
    "@context": "https://schema.org", "@type": "OnlineStore", name: "Xvond Store",
    url: absoluteUrl(`/${locale}`), parentOrganization: { "@type": "Organization", name: "Xvond", url: "https://xvond.com" },
    areaServed: { "@type": "Country", name: "Oman" }
  };
  return (
    <div lang={locale} dir={direction(locale)} className={`locale-${locale}`}>
      <CommerceProvider><StoreHeader locale={locale} />{children}<StoreFooter locale={locale} /></CommerceProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organization).replace(/</g, "\\u003c") }} />
    </div>
  );
}
