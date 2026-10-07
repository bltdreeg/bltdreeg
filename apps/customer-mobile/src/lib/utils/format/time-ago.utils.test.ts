import assert from "node:assert/strict";
import { test } from "node:test";
import { timeAgo } from "./time-ago.utils.ts";

test("picks the largest whole unit", () => {
  const now = Date.UTC(2026, 9, 7, 12);
  const ago = (ms: number) => timeAgo(new Date(now - ms).toISOString(), now);
  assert.deepEqual(ago(30_000), { unit: "minutes", count: 0 });
  assert.deepEqual(ago(3 * 3_600_000), { unit: "hours", count: 3 });
  assert.deepEqual(ago(3 * 86_400_000), { unit: "days", count: 3 });
  assert.deepEqual(ago(7 * 86_400_000), { unit: "weeks", count: 1 });
  assert.deepEqual(ago(45 * 86_400_000), { unit: "months", count: 1 });
});
