"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Providers = { email: boolean; phone: boolean; google: boolean; apple: boolean; facebook: boolean };

export function MultiAuthOptions({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const [providers, setProviders] = useState<Providers>({
    email: true,
    phone: false,
    google: false,
    apple: false,
    facebook: false,
  });

  useEffect(() => {
    void fetch(`${apiUrl}/auth/providers`)
      .then(async (response) => {
        if (response.ok) setProviders(await response.json() as Providers);
      })
      .catch(() => undefined);
  }, []);

  if (!providers.google && !providers.apple && !providers.facebook) return null;

  return <div className="multi-auth-options">
    <p>{ar ? "أو تابع باستخدام" : "Or continue with"}</p>
    <div className="admin-actions">
      {providers.google && <a className="secondary-button" href={`${apiUrl}/auth/google/start?locale=${locale}`}>Google</a>}
      {providers.facebook && <a className="secondary-button" href={`${apiUrl}/auth/facebook/start?locale=${locale}`}>Facebook</a>}
      {providers.apple && <a className="secondary-button" href={`${apiUrl}/auth/apple/start?locale=${locale}`}>Apple</a>}
    </div>
  </div>;
}
