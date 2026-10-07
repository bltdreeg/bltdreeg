import assert from "node:assert/strict";
import { test } from "node:test";
import type { SalonSummary } from "../../types/salon/index.ts";
import { activeFilterCount, applyCriteria, EMPTY_CRITERIA, matchesQuery, suggestions } from "./salon-matcher.ts";

const salon = (o: Partial<SalonSummary> & Pick<SalonSummary, "id" | "name">): SalonSummary => ({
  areaId: "maadi",
  areaName: "المعادي",
  distanceKm: 1,
  rating: 4.5,
  reviewsCount: 10,
  priceFrom: 70,
  servicePrices: { haircut: 70 },
  services: ["haircut"],
  imageUrl: null,
  openedOn: "2025-01-01",
  queue: { peopleAhead: 0, waitMinutes: 0 },
  opensAt: null,
  closedWeekdays: [],
  ...o,
});

const lounge = salon({ id: "s3", name: "بربر لاونج المعادي", areaName: "المعادي الجديدة", distanceKm: 1.2, priceFrom: 45, servicePrices: { haircut: 90, beard: 45 }, services: ["haircut", "beard"] });
const point = salon({ id: "s5", name: "Barber Point دجلة", areaName: "دجلة", distanceKm: 2.1, priceFrom: 70, servicePrices: { haircut: 120 }, opensAt: "2026-10-07T12:00:00Z" });
const dahhan = salon({ id: "s2", name: "الدهّان للحلاقة", areaName: "زهراء المعادي", distanceKm: 1.4, closedWeekdays: [5] });
const far = salon({ id: "s9", name: "وردة بيوتي سنتر", distanceKm: 6.4 });
const all = [point, dahhan, lounge, far];

test("query: spelling, stop words, ال, aliases, area", () => {
  assert.equal(matchesQuery(dahhan, "الدهان"), true);
  assert.equal(matchesQuery(far, "صالون ورده"), true);
  assert.equal(matchesQuery(point, "بربر"), true);
  assert.equal(matchesQuery(lounge, "barber"), true);
  assert.equal(matchesQuery(dahhan, "زهراء"), true);
  assert.equal(matchesQuery(dahhan, "النجم"), false);
});

test("filters + default nearest sort + radius", () => {
  assert.deepEqual(applyCriteria(all, EMPTY_CRITERIA).map((s) => s.id), ["s3", "s2", "s5"]);
  assert.deepEqual(applyCriteria(all, { ...EMPTY_CRITERIA, radiusKm: 10 }).map((s) => s.id), ["s3", "s2", "s5", "s9"]);
  assert.deepEqual(applyCriteria(all, { ...EMPTY_CRITERIA, services: ["beard"] }).map((s) => s.id), ["s3"]);
  assert.deepEqual(applyCriteria(all, { ...EMPTY_CRITERIA, openNowOnly: true }).map((s) => s.id), ["s3", "s2"]);
  assert.deepEqual(applyCriteria(all, { ...EMPTY_CRITERIA, day: "2026-10-09" }).map((s) => s.id), ["s3", "s5"]); // الجمعة
  // سعر الخدمة الوحيدة المتختارة، وإلا "من"
  assert.deepEqual(applyCriteria(all, { ...EMPTY_CRITERIA, services: ["haircut"], maxPrice: 100 }).map((s) => s.id), ["s3", "s2"]);
  assert.deepEqual(applyCriteria(all, { ...EMPTY_CRITERIA, maxPrice: 60 }).map((s) => s.id), ["s3"]);
  assert.deepEqual(applyCriteria(all, { ...EMPTY_CRITERIA, sort: "cheapest" }).map((s) => s.id), ["s3", "s5", "s2"]); // تعادل ٧٠: بالترتيب الأصلي
});

test("filter count and suggestions", () => {
  assert.equal(activeFilterCount(EMPTY_CRITERIA), 0);
  assert.equal(activeFilterCount({ ...EMPTY_CRITERIA, sort: "nearest", services: ["beard", "kids"], minPrice: 50, openNowOnly: true }), 5);
  assert.deepEqual(suggestions(all, "الدهان للحلا").map((s) => s.id)[0], "s2");
  assert.deepEqual(suggestions(all, "x"), []);
});
