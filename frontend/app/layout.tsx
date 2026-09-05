import type { Metadata } from "next";
import "./globals.css";
import { absoluteUrl } from "@/lib/urls";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: { default: "Xvond Smart Store | تقنية مختارة لحياتك اليومية", template: "%s | Xvond Smart Store" },
  description: "Xvond Smart Store — تقنية وإكسسوارات مختارة للنساء والأطفال والسيارة، وهدايا مميزة وXvond Box في سلطنة عُمان.",
  applicationName: "Xvond Smart Store",
  alternates: { canonical: absoluteUrl("/ar"), languages: { "ar-OM": absoluteUrl("/ar"), "en-OM": absoluteUrl("/en") } },
  openGraph: { type: "website", siteName: "Xvond Smart Store", locale: "ar_OM", alternateLocale: "en_OM", title: "Xvond Smart Store", description: "تقنية مختارة لحياتك اليومية.", url: absoluteUrl("/ar") },
  robots: { index: true, follow: true }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html suppressHydrationWarning><body>{children}</body></html>;
}

