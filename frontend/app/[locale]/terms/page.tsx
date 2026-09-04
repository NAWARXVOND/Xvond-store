import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal-page";
import { isLocale } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/urls";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const title = locale === "ar" ? "شروط الاستخدام | Xvond Store" : "Terms of Use | Xvond Store";
  const description = locale === "ar" ? "شروط استخدام Xvond Store والشراء منه." : "Terms governing use of and purchases from Xvond Store.";
  return { title, description, alternates: { canonical: absoluteUrl(`/${locale}/terms`) } };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const ar = locale === "ar";
  return (
    <>
      <LegalPage locale={locale} kind="terms" />
      <section className="legal-page shell" aria-label={ar ? "بيانات الجهة القانونية" : "Legal entity details"}>
        <div className="legal-section">
          <h2>{ar ? "بيانات الجهة القانونية" : "Legal entity details"}</h2>
          <p>{ar ? "Xvond Store هو اسم المتجر والعلامة المستخدمة للبيع. الجهة القانونية المسجلة هي مادلين للاستثمار، سجل تجاري رقم 1655015، وموقعها المسجل في المعبيلة الجنوبية، السيب، محافظة مسقط، سلطنة عُمان." : "Xvond Store is the store and trading brand used for sales. The registered legal entity is Madlin For Investment, Commercial Registration No. 1655015, with its registered location in South Al Mabilah, Al Seeb, Muscat Governorate, Sultanate of Oman."}</p>
        </div>
      </section>
    </>
  );
}
