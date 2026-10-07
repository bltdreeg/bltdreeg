import assert from "node:assert/strict";
import { test } from "node:test";
import type { SalonReview } from "../../../lib/types/salon/index.ts";
import { daysFromToday, draftTotal, filterReviews, hoursFromToday, timeOfDayIso } from "./salon-labels.ts";

const wed = new Date(2026, 9, 7, 15).getTime(); // الأربع

test("hours start today and wrap the week", () => {
  const hours = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, opensAt: weekday === 0 ? null : 660, closesAt: weekday === 0 ? null : 1440 }));
  const rows = hoursFromToday(hours, wed);
  assert.deepEqual(rows.map((r) => r.weekday), [3, 4, 5, 6, 0, 1, 2]);
  assert.equal(rows[0].today, true);
  assert.equal(rows[4].opensAt, null);
});

test("times past midnight wrap; days from today", () => {
  assert.equal(new Date(timeOfDayIso(25 * 60, wed)).getHours(), 1);
  assert.equal(new Date(timeOfDayIso(24 * 60, wed)).getHours(), 0);
  assert.equal(daysFromToday(new Date(2026, 9, 8, 0, 5).toISOString(), wed), 1);
  assert.equal(daysFromToday(new Date(2026, 9, 13, 23).toISOString(), wed), 6);
});

test("review filters and draft total", () => {
  const r = (id: string, o: Partial<SalonReview>): SalonReview => ({ id, authorName: id, stars: 4, createdAt: "", text: "", serviceName: null, barberName: null, barberId: null, photoCount: 0, salonReply: null, ...o });
  const list = [r("a", { stars: 5, barberId: "b1" }), r("b", { photoCount: 2 }), r("c", { barberId: "b1" })];
  assert.deepEqual(filterReviews(list, { kind: "five" }).map((x) => x.id), ["a"]);
  assert.deepEqual(filterReviews(list, { kind: "photos" }).map((x) => x.id), ["b"]);
  assert.deepEqual(filterReviews(list, { kind: "barber", barberId: "b1" }).map((x) => x.id), ["a", "c"]);
  assert.equal(draftTotal([{ price: 70 }, { price: 50 }]), 120);
});
