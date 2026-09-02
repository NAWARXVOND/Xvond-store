import type { Metadata } from "next";
import "./globals.css";
import { absoluteUrl } from "@/lib/urls";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: { default: "Xvond Store | متجر إلكتروني فاخر", template: "%s | Xvond Store" },
  description: "Xvond Store — متجر إلكتروني بتشكيلة مختارة للنساء والأطفال والإلكترونيات والبوكسات والهدايا الفاخرة في سلطنة عُمان.",
  applicationName: "Xvond Store",
  alternates: { canonical: absoluteUrl("/ar"), languages: { "ar-OM": absoluteUrl("/ar"), "en-OM": absoluteUrl("/en") } },
  openGraph: { type: "website", siteName: "Xvond Store", locale: "ar_OM", alternateLocale: "en_OM", title: "Xvond Store", description: "اختيارات استثنائية وهدايا فاخرة في مكان واحد.", url: absoluteUrl("/ar") },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning><body>{children}</body></html>;
}

