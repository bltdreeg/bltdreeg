// أقسام الرئيسية (فريم 07–08) — منقولة من HomeState في Flutter. كله جوه 5 كم.
import type { SalonSummary } from "@/lib/types/salon";
import { isOpen, sortSalons, type SalonSort } from "../../../lib/utils/salons/salon-sort.utils.ts";

const RADIUS_KM = 5;
const NEW_DAYS = 45;
const DAY_MS = 86_400_000;

export function homeSections(all: SalonSummary[], sort: SalonSort, now: number, recentIds: string[] = []) {
  const nearby = all.filter((s) => s.distanceKm <= RADIUS_KM);
  return {
    /** "تقدر تدخل دلوقتي": مفتوح وقدامك اتنين بالكتير */
    availableNow: sortSalons(nearby.filter((s) => isOpen(s) && s.queue.peopleAhead <= 2), "leastWait").slice(0, 6),
    /** "مرشّح ليك": بالترتيب اللي في الـ chips */
    recommended: sortSalons(nearby.filter((s) => s.rating !== null), sort).slice(0, 5),
    newInArea: sortSalons(nearby.filter((s) => now - Date.parse(s.openedOn) <= NEW_DAYS * DAY_MS), "newest"),
    /** "آخر صالونات شوفتها": اللي اتفتح فعلاً الأول، وبعدين الأقرب */
    lastSeen: [
      ...recentIds.map((id) => all.find((s) => s.id === id)).filter((s) => s !== undefined),
      ...sortSalons(nearby.filter((s) => !recentIds.includes(s.id)), "nearest"),
    ].slice(0, 5),
  };
}
