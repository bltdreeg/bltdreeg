// فلترة وترتيب المحلات — مشتركة بين الـ API والصفحات
import type { Shop } from "@/lib/types/shop/shop.interface";
import { ShopSort, type ShopFilters } from "@/lib/types/shop/shop-filters.interface";
import { isToday } from "@/lib/utils/format/date.utils";

/** أقرب ميعاد الأول، واللي مفيهوش مواعيد في الآخر */
function bySlot(a: Shop, b: Shop) {
  if (!a.nextSlotAt) return 1;
  if (!b.nextSlotAt) return -1;
  return a.nextSlotAt.localeCompare(b.nextSlotAt);
}

const SORTERS: Record<ShopSort, (a: Shop, b: Shop) => number> = {
  [ShopSort.NEXT_SLOT]: bySlot,
  [ShopSort.NEAREST]: (a, b) => a.distanceKm - b.distanceKm,
  [ShopSort.RATING]: (a, b) => b.rating - a.rating,
  [ShopSort.PRICE]: (a, b) => a.priceFrom - b.priceFrom,
  [ShopSort.NEWEST]: (a, b) => Number(b.isNew ?? false) - Number(a.isNew ?? false),
};

export function filterShops(shops: Shop[], filters: ShopFilters = {}): Shop[] {
  const { q, areaId, maxPrice, maxDistanceKm, todayOnly, sort } = filters;
  const needle = q?.trim().toLowerCase();

  const out = shops.filter((s) => {
    if (needle && !`${s.name} ${s.areaName}`.toLowerCase().includes(needle)) return false;
    if (areaId && s.areaId !== areaId) return false;
    if (maxPrice !== undefined && s.priceFrom > maxPrice) return false;
    if (maxDistanceKm !== undefined && s.distanceKm > maxDistanceKm) return false;
    if (todayOnly && !(s.nextSlotAt && isToday(s.nextSlotAt))) return false;
    return true;
  });

  return out.sort(SORTERS[sort ?? ShopSort.NEXT_SLOT]);
}
