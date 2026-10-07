// قرار العرض لقسم "صالونات قريبة منك" (من غير DOM) — بيتختبر بـ node --test
import type { NearbyBranchesPage } from "@/lib/types/branch";

export type NearbyBranchesView<T extends { items: unknown[] } = NearbyBranchesPage> =
  | { kind: "loading" }
  | { kind: "empty" }
  | { kind: "error" }
  | { kind: "pages"; pages: T[]; stale: boolean };

/**
 * لو طلب الـ GPS فشل بعد ما كانت عندنا قائمة كويسة من الـ IP، منمسحهاش بشاشة error — نفضل نوريها
 * ونعلّم عليها stale عشان الكومبوننت يضيف تنبيه بسيط بدل ما يمسح القائمة كلها.
 */
export function resolveNearbyBranchesView<T extends { items: unknown[] }>(params: {
  pending: boolean;
  isError: boolean;
  pages: T[];
  lastGoodPages: T[] | null;
}): NearbyBranchesView<T> {
  if (params.pending) return { kind: "loading" };

  if (params.isError) {
    const fallback = params.lastGoodPages;
    const hasItems = !!fallback && fallback.some((page) => page.items.length > 0);
    return hasItems ? { kind: "pages", pages: fallback!, stale: true } : { kind: "error" };
  }

  const hasItems = params.pages.some((page) => page.items.length > 0);
  return hasItems ? { kind: "pages", pages: params.pages, stale: false } : { kind: "empty" };
}
