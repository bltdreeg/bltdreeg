// اختبارات وحدة لـ daySlotsForShop — تأكد إن المواعيد مرتّبة وثابتة ومابتتجاوز وقت الإغلاق
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Shop } from "../types/shop/shop.interface.ts";
import { daySlotsForShop } from "./availability.utils.ts";

const MOCK_SHOP: Shop = {
  id: "shop-test",
  name: "صالون الاختبار",
  cityId: "test",
  cityName: "تست",
  distanceKm: 1,
  rating: 4.5,
  reviewCount: 10,
  priceFrom: 80,
  coverImage: "/dummy_salon/1.png",
  nextSlotAt: null,
  services: ["قص شعر"],
};

describe("daySlotsForShop", () => {
  it("المواعيد مرتّبة تصاعدياً", () => {
    const date = new Date("2026-09-20T00:00:00");
    const slots = daySlotsForShop(MOCK_SHOP, date, 30);
    for (let i = 1; i < slots.length; i++) {
      assert.ok(
        slots[i].startAt > slots[i - 1].startAt,
        `الميعاد ${i} جاي بعد ${i - 1}`,
      );
    }
  });

  it("نفس المحل ونفس اليوم بيرجّعوا نفس المواعيد", () => {
    const date = new Date("2026-09-20T00:00:00");
    const first = daySlotsForShop(MOCK_SHOP, date, 30);
    const second = daySlotsForShop(MOCK_SHOP, date, 30);
    assert.deepStrictEqual(first, second, "النتيجة لازم تكون ثابتة");
  });

  it("مفيش ميعاد بيتجاوز وقت الإغلاق (10 مساءً)", () => {
    const date = new Date("2026-09-20T00:00:00");
    const close = new Date("2026-09-20T22:00:00");
    // استخدام مدة طويلة عشان ناخد حالة الحافة
    const slots = daySlotsForShop(MOCK_SHOP, date, 60);
    for (const slot of slots) {
      const end = new Date(slot.startAt);
      end.setMinutes(end.getMinutes() + 60);
      assert.ok(end <= close, `ميعاد ${slot.startAt} بيتعدى الإغلاق`);
    }
  });

  it("مدة طويلة جداً تعمل مواعيد أقل من مدة قصيرة", () => {
    const date = new Date("2026-09-20T00:00:00");
    const short = daySlotsForShop(MOCK_SHOP, date, 20);
    const long = daySlotsForShop(MOCK_SHOP, date, 90);
    assert.ok(short.length > long.length, "المدة الأطول = مواعيد أقل");
  });
});
