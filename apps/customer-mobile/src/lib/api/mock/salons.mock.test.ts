import assert from "node:assert/strict";
import { test } from "node:test";
import { createCatalog, DRIFT_MS } from "./salons.mock.ts";

test("Maadi cluster has the 10 salons, other areas none", () => {
  const c = createCatalog();
  assert.equal(c.salons("maadi").length, 10);
  assert.equal(c.salons("degla").length, 10);
  assert.deepEqual(c.salons("nasr-city"), []);
  assert.equal(c.areas().filter((a) => a.is_nearby).length, 4);
});

test("drift moves open queues only, within 0–8, and keeps wait = ahead × per-person", () => {
  let now = Date.UTC(2026, 9, 7, 9);
  const c = createCatalog(() => now);
  const before = c.salons("maadi");
  now += 200 * DRIFT_MS;
  const after = c.salons("maadi");
  assert.ok(after.some((s, i) => s.queue.people_ahead !== before[i].queue.people_ahead), "something moved");
  for (const [i, s] of after.entries()) {
    assert.ok(s.queue.people_ahead >= 0 && s.queue.people_ahead <= 8);
    if (s.opens_at !== null) assert.deepEqual(s.queue, before[i].queue, "closed salons don't move");
    if (s.queue.people_ahead === 0) assert.equal(s.queue.wait_minutes, 0);
  }
});

test("closed salons get opens_at; s8 always opens tomorrow", () => {
  const now = Date.UTC(2026, 9, 7, 9);
  const s8 = createCatalog(() => now).salons("maadi").find((s) => s.id === "s8")!;
  assert.ok(new Date(s8.opens_at!).getTime() - now > 12 * 3_600_000);
});
