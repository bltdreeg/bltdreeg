import assert from "node:assert/strict";
import { test } from "node:test";
import type { SalonSummary } from "../../types/salon/index.ts";
import { normalizeArabic } from "./arabic-normalize.utils.ts";
import { sortSalons } from "./salon-sort.utils.ts";

const salon = (id: string, o: Partial<SalonSummary> = {}): SalonSummary => ({
  id, name: id, areaId: "maadi", areaName: "المعادي", distanceKm: 1, rating: 4, reviewsCount: 0, priceFrom: 50, servicePrices: {}, services: [],
  imageUrl: null, openedOn: "2026-01-01T00:00:00Z", queue: { peopleAhead: 0, waitMinutes: 0 }, opensAt: null, closedWeekdays: [], ...o,
});

test("leastWait: open first, then shortest wait, then nearest", () => {
  const list = [
    salon("closed", { opensAt: "2026-10-07T09:00:00Z" }),
    salon("busy", { queue: { peopleAhead: 3, waitMinutes: 27 } }),
    salon("freeFar", { distanceKm: 3 }),
    salon("freeNear", { distanceKm: 0.5 }),
  ];
  assert.deepEqual(sortSalons(list, "leastWait").map((s) => s.id), ["freeNear", "freeFar", "busy", "closed"]);
});

test("other sorts", () => {
  const a = salon("a", { distanceKm: 2, rating: null, priceFrom: 40, openedOn: "2026-09-01T00:00:00Z" });
  const b = salon("b", { distanceKm: 1, rating: 4.9, priceFrom: 90, openedOn: "2025-01-01T00:00:00Z" });
  assert.deepEqual(sortSalons([a, b], "nearest").map((s) => s.id), ["b", "a"]);
  assert.deepEqual(sortSalons([a, b], "topRated").map((s) => s.id), ["b", "a"]);
  assert.deepEqual(sortSalons([b, a], "cheapest").map((s) => s.id), ["a", "b"]);
  assert.deepEqual(sortSalons([b, a], "newest").map((s) => s.id), ["a", "b"]);
});

test("normalizeArabic folds spelling variants, diacritics and digits", () => {
  assert.equal(normalizeArabic("دجله"), normalizeArabic("دجلة"));
  assert.equal(normalizeArabic("الدهّان"), "الدهان");
  assert.equal(normalizeArabic("  إمبابة  ٢ "), "امبابه 2");
  assert.equal(normalizeArabic("Barber"), "barber");
});
