"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type Providers = { email: boolean; phone: boolean; google: boolean; apple: boolean };

export function MultiAuthOptions({ locale, onSignedIn }: { locale: Locale; onSignedIn: () => void }) {
  const ar = locale === "ar";
  const [providers, setProviders] = useState<Providers>({ email: true, phone: false, google: false, apple: false });
  const [phoneStage, setPhoneStage] = useState<"idle" | "code">("idle");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch(`${apiUrl}/auth/providers`)
      .then(async (response) => { if (response.ok) setProviders(await response.json() as Providers); })
      .catch(() => undefined);
  }, []);

  async function startPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setBusy(true);
    try {
      const data = new FormData(event.currentTarget);
      const value = String(data.get("phone") || "");
      const response = await fetch(`${apiUrl}/auth/phone/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: value, locale }),
      });
      if (!response.ok) throw new Error("phone_start_failed");
      const body = await response.json() as { phone: string };
      setPhone(body.phone);
      setPhoneStage("code");
      setMessage(ar ? "أرسلنا رمز التحقق إلى رقمك." : "We sent a verification code to your phone.");
    } catch {
      setMessage(ar ? "تعذر إرسال رمز التحقق. تأكد من رقم عُماني صحيح." : "Could not send the code. Check the Oman phone number.");
    } finally { setBusy(false); }
  }

  async function verifyPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(""); setBusy(true);
    try {
      const data = new FormData(event.currentTarget);
      const response = await fetch(`${apiUrl}/auth/phone/verify`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          code: data.get("code"),
          email: String(data.get("email") || "").trim() || null,
          full_name: String(data.get("full_name") || "").trim() || null,
        }),
      });
      if (response.status === 409) {
        setMessage(ar ? "أول مرة بهذا الرقم: أدخل الاسم والبريد ثم أعد التحقق." : "First time with this number: enter your name and email, then verify again.");
        return;
      }
      if (!response.ok) throw new Error("phone_verify_failed");
      onSignedIn();
      window.dispatchEvent(new Event("xvond-account-changed"));
    } catch {
      setMessage(ar ? "رمز التحقق غير صحيح أو منتهي." : "The verification code is invalid or expired.");
    } finally { setBusy(false); }
  }

  if (!providers.phone && !providers.google && !providers.apple) return null;

  return <div className="multi-auth-options">
    <p>{ar ? "أو تابع باستخدام" : "Or continue with"}</p>
    <div className="admin-actions">
      {providers.google && <a className="secondary-button" href={`${apiUrl}/auth/google/start?locale=${locale}`}>Google</a>}
      {providers.apple && <a className="secondary-button" href={`${apiUrl}/auth/apple/start?locale=${locale}`}>Apple</a>}
    </div>
    {providers.phone && phoneStage === "idle" && <form onSubmit={(event) => void startPhone(event)}>
      <label>{ar ? "رقم الهاتف العُماني" : "Oman phone number"}<input name="phone" type="tel" placeholder="+968 9XXXXXXX" required /></label>
      <button className="secondary-button" disabled={busy}>{ar ? "الدخول برقم الهاتف" : "Continue with phone"}</button>
    </form>}
    {providers.phone && phoneStage === "code" && <form onSubmit={(event) => void verifyPhone(event)}>
      <label>{ar ? "رمز التحقق" : "Verification code"}<input name="code" inputMode="numeric" required /></label>
      <label>{ar ? "الاسم الكامل (مطلوب لأول تسجيل فقط)" : "Full name (first sign-up only)"}<input name="full_name" /></label>
      <label>{ar ? "البريد الإلكتروني (مطلوب لأول تسجيل فقط)" : "Email (first sign-up only)"}<input name="email" type="email" /></label>
      <button className="secondary-button" disabled={busy}>{ar ? "تأكيد والدخول" : "Verify and sign in"}</button>
      <button className="text-button" type="button" onClick={() => { setPhoneStage("idle"); setMessage(""); }}>{ar ? "استخدام رقم آخر" : "Use another number"}</button>
    </form>}
    {message && <p className="coupon-message">{message}</p>}
  </div>;
}
