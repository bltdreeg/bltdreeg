// ponytail: تسجيل دخول وهمي للتطوير بس — بيحط كوكي الجلسة على طول من غير مصادقة حقيقية.
// المصادقة الحقيقية لسه مش متاحة (auth.action.ts). امسح الملف ده لما تتعمل.
// لما تتعمل: الكوكي لازم تبقى httpOnly + secure، و useUser() لازم يوقف يقرأ document.cookie.
"use server";

import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import { GUEST_COOKIE, SESSION_COOKIE } from "@/lib/data/constants/app.constants";
import { ROUTE_HOME } from "@/lib/data/constants/routes.constants";

const THIRTY_DAYS_SECONDS = 60 * 60 * 24 * 30;

export async function devLogin(formData: FormData, locale: string): Promise<void> {
  const callbackUrl = String(formData.get("callbackUrl") || ROUTE_HOME);
  const rememberMe = formData.get("rememberMe") !== "false";
  const store = await cookies();
  store.set(SESSION_COOKIE, "dev-session", {
    path: "/",
    sameSite: "lax",
    // من غير maxAge بتبقى session cookie وبتتمسح لما التاب يتقفل — عكس الموبايل اللي بيفتكر الجلسة.
    maxAge: rememberMe ? THIRTY_DAYS_SECONDS : undefined,
  });
  // تسجيل الدخول بيمسح اختيار "زائر" — زي setGuestMode(false) في الموبايل.
  store.delete(GUEST_COOKIE);
  redirect({ href: callbackUrl, locale });
}

export async function continueAsGuest(locale: string): Promise<void> {
  const store = await cookies();
  store.set(GUEST_COOKIE, "1", {
    path: "/",
    sameSite: "lax",
    maxAge: THIRTY_DAYS_SECONDS * 12,
  });
  redirect({ href: ROUTE_HOME, locale });
}

/** بيفتح الجلسة بعد تأكيد الكود — من غير redirect عشان الفورم يتحكم في التوجيه. */
export async function completeOtpLogin(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "dev-session", {
    path: "/",
    sameSite: "lax",
    maxAge: THIRTY_DAYS_SECONDS,
  });
  store.delete(GUEST_COOKIE);
}
