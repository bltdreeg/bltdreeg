// قرار التحويل في proxy.ts كدالة نقية عشان تتختبر — بتعتمد على الكوكيز بس، من غير API call
import {
  ROUTE_ACCOUNT,
  ROUTE_BOOKINGS,
  ROUTE_BOOK_ROOT,
  ROUTE_FORGOT_PASSWORD,
  ROUTE_HOME,
  ROUTE_LOGIN,
  ROUTE_ONBOARDING,
  ROUTE_REGISTER,
} from "../../data/constants/routes.constants.ts";

// مسار الحجز كله محمي — مطابق للموبايل
export const PROTECTED_ROUTES = [ROUTE_BOOK_ROOT, ROUTE_BOOKINGS, ROUTE_ACCOUNT] as const;
/** صفحات للزوار بس؛ verify-otp و reset-password مش هنا لأنها بتتفتح في نص الفلو */
const GUEST_ONLY_ROUTES = [ROUTE_LOGIN, ROUTE_REGISTER, ROUTE_FORGOT_PASSWORD] as const;

function matches(routes: readonly string[], path: string): boolean {
  return routes.some((route) => path === route || path.startsWith(`${route}/`));
}

export function isProtectedPath(pathnameWithoutLocale: string): boolean {
  return matches(PROTECTED_ROUTES, pathnameWithoutLocale);
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
  const isProtected = isProtectedPath(path);
  const isOnboarding = matches([ROUTE_ONBOARDING], path);

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
