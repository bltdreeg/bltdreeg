// بعد أي دخول: نرجّع المستخدم للمكان اللي كان رايحه، أو للـ onboarding لو حسابه ناقص
import { CALLBACK_PARAM } from "../../data/constants/app.constants.ts";
import { ROUTE_HOME, ROUTE_ONBOARDING } from "../../data/constants/routes.constants.ts";
import type { CustomerOnboarding } from "../../types/auth/customer.interface.ts";

/** مسار نسبي في نفس الموقع بس — يمنع open redirect زي //evil.com */
export function safeCallback(url: string | null | undefined): string | null {
  if (!url || !url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) return null;
  return url;
}

export function afterAuthPath(
  user: { onboarding: CustomerOnboarding },
  callbackUrl?: string | null,
  opts: { isNewAccount?: boolean } = {},
): string {
  const back = safeCallback(callbackUrl) ?? ROUTE_HOME;
  // حساب جديد بنسأله على الموقع وتاريخ الميلاد مرة واحدة حتى لو مش إجباريين
  const askOptional = opts.isNewAccount === true && user.onboarding.skippable.length > 0;
  if (!user.onboarding.complete || askOptional) {
    return `${ROUTE_ONBOARDING}?${CALLBACK_PARAM}=${encodeURIComponent(back)}`;
  }
  return back;
}
