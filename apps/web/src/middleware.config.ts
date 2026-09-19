// المسارات المحمية اللي بتحتاج جلسة — بيستخدمها proxy.ts
import { ROUTE_ACCOUNT, ROUTE_BOOKINGS, ROUTE_BOOK_ROOT } from "@/lib/data/constants/routes.constants";

// مسار الحجز كله محمي — مطابق للموبايل، اللي بيحوّل الزائر لتسجيل الدخول
// من أول خطوة (bookingSlot ضمن AppRoutes.protectedRoutes).
export const PROTECTED_ROUTES = [ROUTE_BOOK_ROOT, ROUTE_BOOKINGS, ROUTE_ACCOUNT] as const;

export function isProtectedPath(pathnameWithoutLocale: string) {
  return PROTECTED_ROUTES.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`),
  );
}
