// قرار التحويل في proxy.ts كدالة نقية عشان تتختبر — بتعتمد على الكوكيز بس، من غير API call
import {
  ROUTE_FAVORITES,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_OFFLINE,
  ROUTE_ONBOARDING,
  ROUTE_PRIVACY,
  ROUTE_REFUND_POLICY,
  ROUTE_REGISTER,
  ROUTE_RESET_PASSWORD,
  ROUTE_SALON_ROOT,
  ROUTE_SEARCH,
  ROUTE_TERMS,
  ROUTE_VERIFY_OTP,
} from "../../data/constants/routes.constants.ts";

// المسارات العامة بس هي اللي بتتفتح من غير جلسة — أي مسار تاني محمي تلقائيًا (نفس نمط LMS)
export const PUBLIC_ROUTES: readonly string[] = [
  ROUTE_HOME,
  ROUTE_SEARCH,
  ROUTE_FAVORITES,
  ROUTE_OFFLINE,
  ROUTE_TERMS,
  ROUTE_PRIVACY,
  ROUTE_REFUND_POLICY,
  ROUTE_LOGIN,
  ROUTE_REGISTER,
  ROUTE_VERIFY_OTP,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_RESET_PASSWORD,
];
/** مسارات عامة بكل ما تحتها (مثلًا /salon/12) */
export const PUBLIC_PREFIX_ROUTES: readonly string[] = [ROUTE_SALON_ROOT];
/** صفحات للزوار بس؛ verify-otp و reset-password مش هنا لأنها بتتفتح في نص الفلو */
const GUEST_ONLY_ROUTES = [ROUTE_LOGIN, ROUTE_REGISTER, ROUTE_FORGOT_PASSWORD] as const;

function matches(routes: readonly string[], path: string): boolean {
  return routes.some((route) => path === route || path.startsWith(`${route}/`));
}

export function isPublicPath(pathnameWithoutLocale: string): boolean {
  return PUBLIC_ROUTES.includes(pathnameWithoutLocale) || matches(PUBLIC_PREFIX_ROUTES, pathnameWithoutLocale);
}

export function isProtectedPath(pathnameWithoutLocale: string): boolean {
  return !isPublicPath(pathnameWithoutLocale);
}

export interface GuardInput {
  path: string;
  search: string;
  hasSession: boolean;
  needsOnboarding: boolean;
}

export interface GuardRedirect {
  to: string;
  callback: string | null;
}

export function guardRedirect({ path, search, hasSession, needsOnboarding }: GuardInput): GuardRedirect | null {
  const isOnboarding = matches([ROUTE_ONBOARDING], path);
  const isProtected = isProtectedPath(path) && !isOnboarding;

  if (!hasSession) {
    return isProtected || isOnboarding ? { to: ROUTE_LOGIN, callback: path + search } : null;
  }
  if (matches(GUEST_ONLY_ROUTES, path)) {
    return { to: needsOnboarding ? ROUTE_ONBOARDING : ROUTE_HOME, callback: null };
  }
  if (needsOnboarding && isProtected) {
    return { to: ROUTE_ONBOARDING, callback: path + search };
  }
  return null;
}
