/**
 * فحص سريع لمنطق الفلترة والترتيب.
 * شغّله: npx tsx src/lib/utils/filter-shops.check.ts
 */
import assert from "node:assert/strict";
import type { Shop } from "@/lib/types/shop/shop.interface";
import { ShopSort } from "@/lib/types/shop/shop-filters.interface";
import { filterShops } from "./filter-shops.utils";

const at = (h: number, dayOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

const shop = (over: Partial<Shop> & Pick<Shop, "id">): Shop => ({
  name: "صالون",
  areaId: "maadi",
  areaName: "المعادي",
  distanceKm: 1,
  rating: 4,
  reviewCount: 10,
  priceFrom: 100,
  coverImage: "",
  nextSlotAt: at(18),
  services: [],
  ...over,
});

const today = shop({ id: "today", nextSlotAt: at(18), priceFrom: 200, distanceKm: 5 });
const early = shop({ id: "early", nextSlotAt: at(9), priceFrom: 50, distanceKm: 3, rating: 4.9 });
const tomorrow = shop({
  id: "tomorrow",
  nextSlotAt: at(11, 1),
  areaId: "dokki",
  areaName: "الدقي",
  distanceKm: 8,
});
const none = shop({ id: "none", nextSlotAt: null, distanceKm: 9 });
const all = [today, early, tomorrow, none];

// الترتيب الافتراضي: أقرب ميعاد الأول، واللي مفيهوش مواعيد في الآخر
assert.deepEqual(
  filterShops(all).map((s) => s.id),
  ["early", "today", "tomorrow", "none"],
);

// مواعيد النهارده بس — بتستبعد بكرة واللي مفيهوش
assert.deepEqual(
  filterShops(all, { todayOnly: true }).map((s) => s.id),
  ["early", "today"],
);

// البحث بيلاقي بالمنطقة زي ما بيلاقي بالاسم
assert.deepEqual(filterShops(all, { q: "الدقي" }).map((s) => s.id), ["tomorrow"]);

// الفلاتر بتتجمع مع بعض — today برّه بالسعر (200)، وtomorrow/none برّه بالمسافة (8/9)
assert.deepEqual(
  filterShops(all, { maxPrice: 100, maxDistanceKm: 4 }).map((s) => s.id),
  ["early"],
);

// الترتيب بالسعر والتقييم والمسافة
assert.equal(filterShops(all, { sort: ShopSort.PRICE })[0].id, "early");
assert.equal(filterShops(all, { sort: ShopSort.RATING })[0].id, "early");
// early=3كم · today=5 · tomorrow=8 · none=9
assert.deepEqual(
  filterShops(all, { sort: ShopSort.NEAREST }).map((s) => s.id),
  ["early", "today", "tomorrow", "none"],
);

// الفلترة مابتغيّرش المصفوفة الأصلية
const order = all.map((s) => s.id);
filterShops(all, { sort: ShopSort.PRICE });
assert.deepEqual(all.map((s) => s.id), order, "filterShops must not mutate its input");

console.log("✓ filter-shops checks passed");
