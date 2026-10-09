import assert from "node:assert/strict";
import { test } from "node:test";
import { nextDays } from "../../../lib/utils/day-keys.ts";
import { groupSlots, isClosedOn } from "./slot-groups.ts";

const wed = new Date(2026, 9, 7, 15).getTime(); // الأربع

test("seven days from today, month wraps", () => {
  assert.deepEqual(nextDays(wed), ["2026-10-07", "2026-10-08", "2026-10-09", "2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13"]);
  assert.equal(nextDays(new Date(2026, 9, 30).getTime())[2], "2026-11-01");
});

test("closed weekday", () => {
  const hours = [{ weekday: 3, opensAt: null, closesAt: null }, { weekday: 4, opensAt: 660, closesAt: 1440 }];
  assert.equal(isClosedOn("2026-10-07", hours), true);
  assert.equal(isClosedOn("2026-10-08", hours), false);
});

test("slots split by period; after midnight stays evening", () => {
  const at = (d: number, h: number, m = 0) => ({ start: new Date(2026, 9, d, h, m).toISOString(), freeBarberIds: ["b"] });
  const groups = groupSlots("2026-10-07", [at(7, 11), at(7, 11, 30), at(7, 13), at(7, 19), at(8, 0, 30)]);
  assert.deepEqual(groups.map(([p, s]) => [p, s.length]), [["morning", 2], ["afternoon", 1], ["evening", 2]]);
});
