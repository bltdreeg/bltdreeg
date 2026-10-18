import assert from "node:assert/strict";
import { test } from "node:test";
import { cairoToday, formatClock, formatInstantClock, instantCairoDay, slotDayLabel } from "./slot-format.ts";

// 22:30 UTC يوم 18 = 01:30 يوم 19 في القاهرة (UTC+3 في أكتوبر)
const lateNightUtc = new Date("2026-10-18T22:30:00Z");

test("today is computed in cairo, not utc", () => {
  assert.equal(cairoToday(lateNightUtc), "2026-10-19");
});

test("day labels", () => {
  assert.deepEqual(slotDayLabel("2026-10-19", "ar", lateNightUtc), { kind: "today" });
  assert.deepEqual(slotDayLabel("2026-10-20", "ar", lateNightUtc), { kind: "tomorrow" });
  assert.deepEqual(slotDayLabel("2026-10-23", "en", lateNightUtc), { kind: "date", label: "Friday, October 23" });
});

test("clock formatting", () => {
  assert.equal(formatClock("18:30", "ar"), "6:30 م");
  assert.equal(formatClock("09:05", "en"), "9:05 AM");
  assert.equal(formatClock("00:00", "en"), "12:00 AM");
  assert.equal(formatClock("12:00", "ar"), "12:00 م");
});

test("instants are shown in cairo time", () => {
  assert.equal(formatInstantClock("2026-10-18T15:30:00+00:00", "en"), "6:30 PM");
  assert.equal(instantCairoDay("2026-10-18T22:30:00Z"), "2026-10-19");
});
