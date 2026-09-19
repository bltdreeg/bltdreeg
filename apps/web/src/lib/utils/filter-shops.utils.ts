// فلترة وترتيب المحلات — مشتركة بين الـ API والصفحات
import type { Shop } from "@/lib/types/shop/shop.interface";
import { ShopSort, type ShopFilters } from "@/lib/types/shop/shop-filters.interface";
import { isToday } from "@/lib/utils/format/date.utils";

/**
 * تطبيع النص العربي عشان البحث يلاقي اللي المستخدم قاصده:
 * الألف بأشكالها، التاء المربوطة، الياء/الألف المقصورة، والتشكيل والتطويل.
 * كده «بربر» بتلاقي «باربر» و«الاعلى» بتلاقي «الأعلى».
 */
function normalizeArabic(text: string) {
  return text
    .toLowerCase()
    .replace(/[ً-ْـ]/g, "") // تشكيل وتطويل
    .replace(/[آأإا]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي");
}

/**
 * الأسماء المنقولة بتتكتب بألف وبدونها — «بربر» و«باربر»، «جيمس» و«جيمز».
 * بنشيل الألف اللي جوّه الكلمة (مش أولها) في الطرفين عشان الاتنين يتقابلوا.
 * بنقارن كلمة بكلمة عشان ماتبقاش مطابقة جزئية غلط.
 */
function foldOptionalAlef(text: string) {
  return text.replace(/\S+/g, (word) => word[0] + word.slice(1).replace(/ا/g, ""));
}

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
  const { q, areaId, maxPrice, maxDistanceKm, todayOnly, services, sort } = filters;
  const trimmed = q?.trim();
  const needle = trimmed ? foldOptionalAlef(normalizeArabic(trimmed)) : undefined;

  const out = shops.filter((s) => {
    if (needle) {
      const haystack = foldOptionalAlef(normalizeArabic(`${s.name} ${s.areaName}`));
      if (!haystack.includes(needle)) return false;
    }
    if (areaId && s.areaId !== areaId) return false;
    if (maxPrice !== undefined && s.priceFrom > maxPrice) return false;
    if (maxDistanceKm !== undefined && s.distanceKm > maxDistanceKm) return false;
    if (todayOnly && !(s.nextSlotAt && isToday(s.nextSlotAt))) return false;
    if (services?.length && !services.some((svc) => s.services.includes(svc))) return false;
    return true;
  });

  return out.sort(SORTERS[sort ?? ShopSort.NEXT_SLOT]);
}
