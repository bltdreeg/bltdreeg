import assert from "node:assert/strict";
import { test } from "node:test";
import { clock, joinNames, leaveAt } from "./queue-labels.ts";

const now = new Date(2026, 9, 7, 9, 41).getTime();

test("leave at = wait minus travel, or now", () => {
  assert.equal(leaveAt(28, 4, now), now + 24 * 60_000);
  assert.equal(leaveAt(4, 4, now), null);
  assert.equal(leaveAt(2, 10, now), null);
});

test("names join like the board", () => {
  const two = (a: string, b: string) => `${a} و${b}`;
  assert.equal(joinNames([], "، ", two), "");
  assert.equal(joinNames(["أحمد"], "، ", two), "أحمد");
  assert.equal(joinNames(["أحمد", "محمود"], "، ", two), "أحمد ومحمود");
  assert.equal(joinNames(["أ", "ب", "ج"], "، ", two), "أ، ب وج");
});

test("countdown m:ss, rounds up, never negative", () => {
  assert.equal(clock(272_000), "4:32");
  assert.equal(clock(300_000), "5:00");
  assert.equal(clock(400), "0:01");
  assert.equal(clock(-5), "0:00");
});
