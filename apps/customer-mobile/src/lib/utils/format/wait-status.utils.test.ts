import assert from "node:assert/strict";
import { test } from "node:test";
import { waitRange, waitStatus } from "./wait-status.utils.ts";

test("wait status follows people ahead, closed and offline", () => {
  const load = (peopleAhead: number) => ({ peopleAhead, waitMinutes: peopleAhead * 10 });
  assert.equal(waitStatus(load(0), true, true), "free");
  assert.equal(waitStatus(load(1), true, true), "short");
  assert.equal(waitStatus(load(2), true, true), "mid");
  assert.equal(waitStatus(load(3), true, true), "mid");
  assert.equal(waitStatus(load(5), true, true), "busy");
  assert.equal(waitStatus(load(0), false, true), "closed");
  assert.equal(waitStatus(load(0), false, false), "stale");
});

test("wait range is ±20% rounded to 5 minutes", () => {
  assert.deepEqual(waitRange(12), { min: 10, max: 15 });
  assert.deepEqual(waitRange(28), { min: 20, max: 35 });
  assert.deepEqual(waitRange(2), { min: 0, max: 5 });
  assert.deepEqual(waitRange(0), { min: 0, max: 0 });
});
