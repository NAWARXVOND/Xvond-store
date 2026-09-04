"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export function PasswordRecovery({ locale, token, purpose }: { locale: Locale; token?: string; purpose?: string }) {
  const ar = locale === "ar";
  const [message, setMessage] = useState("");
  const verifyingEmail = Boolean(token && purpose === "verify-email");
  const linkingEmail = Boolean(token && purpose === "link-email");
  const verifying = verifyingEmail || linkingEmail;

  useEffect(() => {
    if (!verifying || !token) return;
    const endpoint = linkingEmail ? "/account/profile/email/confirm" : "/auth/email/verify";
    void fetch(`${apiUrl}${endpoint}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    }).then((response) => setMessage(
      response.ok
        ? (linkingEmail
            ? (ar ? "تم ربط البريد بحسابك بنجاح." : "Your email was linked successfully.")
            : (ar ? "تم تأكيد بريدك بنجاح." : "Your email is verified."))
        : (ar ? "الرابط غير صالح أو منتهي." : "The link is invalid or expired."),
    ));
  }, [ar, linkingEmail, token, verifying]);

  async function submit(form: FormData) {
    const response = token
      ? await fetch(`${apiUrl}/auth/password/reset`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password: form.get("password") }),
        })
      : await fetch(`${apiUrl}/auth/password/forgot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.get("email") }),
        });
    setMessage(response.ok
      ? (token
          ? (ar ? "تم تغيير كلمة المرور." : "Password updated.")
          : (ar ? "إذا كان الحساب موجودًا ستصلك رسالة الاستعادة." : "If the account exists, a recovery email will be sent."))
      : (ar ? "تعذر إكمال الطلب." : "Could not complete the request."));
  }

  return <main className="content-page shell account-auth"><form action={submit}><p className="eyebrow">XVOND SECURITY</p><h1>{verifying ? (linkingEmail ? (ar ? "ربط البريد" : "Link email") : (ar ? "تأكيد البريد" : "Verify email")) : token ? (ar ? "كلمة مرور جديدة" : "New password") : (ar ? "استعادة كلمة المرور" : "Password recovery")}</h1>{!verifying && (token ? <label>{ar ? "كلمة المرور الجديدة" : "New password"}<input name="password" type="password" minLength={10} required /></label> : <label>{ar ? "البريد الإلكتروني" : "Email"}<input name="email" type="email" required /></label>)}{message && <p>{message}</p>}{!verifying && <button className="primary-button">{ar ? "متابعة" : "Continue"}</button>}<Link className="text-button" href={`/${locale}/account`}>{ar ? "العودة للحساب" : "Back to account"}</Link></form></main>;
}
