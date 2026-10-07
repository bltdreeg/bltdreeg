// ترتيب الصالونات — منقول من SalonMatcher.sort في Flutter. الرئيسية والبحث والمفضلة بيستخدموه.
import type { SalonSummary } from "@/lib/types/salon";

export type SalonSort = "leastWait" | "nearest" | "topRated" | "cheapest" | "newest";

export const isOpen = (s: SalonSummary) => s.opensAt === null;

const COMPARE: Record<SalonSort, (a: SalonSummary, b: SalonSummary) => number> = {
  // المفتوح الأول، بعدين أقل انتظار، بعدين الأقرب
  leastWait: (a, b) => Number(isOpen(b)) - Number(isOpen(a)) || a.queue.waitMinutes - b.queue.waitMinutes || a.distanceKm - b.distanceKm,
  nearest: (a, b) => a.distanceKm - b.distanceKm,
  topRated: (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
  cheapest: (a, b) => a.priceFrom - b.priceFrom,
  newest: (a, b) => Date.parse(b.openedOn) - Date.parse(a.openedOn),
};

export function sortSalons(list: SalonSummary[], sort: SalonSort): SalonSummary[] {
  return [...list].sort(COMPARE[sort]);
}
