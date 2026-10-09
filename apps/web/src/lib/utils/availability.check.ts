/**
 * فحص سريع لتوليد المواعيد وتجميعها بالفترة.
 * شغّله: npx tsx src/lib/utils/availability.check.ts
 */
import assert from "node:assert/strict";
import type { Shop } from "@/lib/types/shop/shop.interface";
import { Period, groupByPeriod, periodOf, slotsForShop } from "./availability.utils";

const at = (h: number, dayOffset = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

const shop = (over: Partial<Shop> & Pick<Shop, "id">): Shop => ({
  name: "صالون",
  cityId: "maadi",
  cityName: "المعادي",
  distanceKm: 1,
  rating: 4,
  reviewCount: 10,
  priceFrom: 100,
  coverImage: "",
  nextSlotAt: at(18),
  services: [],
  ...over,
});

// نفس المحل بيرجّع نفس المواعيد بالظبط — عشان السيرفر والكلاينت يتفقوا
const shopA = shop({ id: "shop-a", nextSlotAt: at(18) });
assert.deepEqual(slotsForShop(shopA), slotsForShop(shopA));

// أول ميعاد هو nextSlotAt بالظبط، والخطوة بينهم 45 دقيقة
const slots = slotsForShop(shopA);
// أقصى 3 مواعيد لكل محل — عشان صف الشرايح ماياخدش أكتر من 3 في صف الكارت
assert.ok(slots.length >= 2 && slots.length <= 3);
assert.equal(slots[0].startAt, shopA.nextSlotAt);
assert.equal(
  new Date(slots[1].startAt).getTime() - new Date(slots[0].startAt).getTime(),
  45 * 60_000,
);

// مفيش ميعاد النهارده → مفيش مواعيد خالص
assert.deepEqual(slotsForShop(shop({ id: "shop-b", nextSlotAt: null })), []);

// الميعاد بكرة مش النهارده → برضو مفيش مواعيد للتاريخ الافتراضي (النهارده)
assert.deepEqual(slotsForShop(shop({ id: "shop-c", nextSlotAt: at(18, 1) })), []);

// حدود الفترات
assert.equal(periodOf(at(9)), Period.MORNING);
assert.equal(periodOf(at(14)), Period.AFTERNOON);
assert.equal(periodOf(at(19)), Period.EVENING);

// التجميع بيحافظ على كل المواعيد وبيوزّعهم صح
const grouped = groupByPeriod(slots);
const total = grouped.morning.length + grouped.afternoon.length + grouped.evening.length;
assert.equal(total, slots.length);

console.log("✓ availability checks passed");
