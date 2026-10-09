import assert from "node:assert/strict";
import { test } from "node:test";
import { MockHttpError } from "./router.ts";
import { createSalonDetails } from "./salon-details.mock.ts";
import { createCatalog, DRIFT_MS } from "./salons.mock.ts";

test("s1 carries the board's content", () => {
  const p = createSalonDetails(createCatalog()).page("s1");
  assert.deepEqual(p.serviceGroups.map((g) => g.services.length), [3, 2]);
  assert.deepEqual(p.barbers.map((b) => b.name), ["أحمد مجدي", "محمود السيد", "كريم عبد الله"]);
  assert.equal(p.barbers[2].queue, null);
  assert.deepEqual(p.offers.map((o) => o.kind), ["discount", "bundle", "loyalty"]);
  assert.equal(p.reviews.length, 4);
  assert.equal(p.hours.find((h) => h.weekday === 0)!.opensAt, null, "closed on Sunday");
  assert.equal(p.gallery.length, 13);
});

test("unknown salon → 404", () => {
  assert.throws(() => createSalonDetails(createCatalog()).page("nope"), (e) => e instanceof MockHttpError && e.status === 404);
});

test("named barbers queue behind the salon's shared queue", () => {
  let now = Date.UTC(2026, 9, 7, 9);
  const catalog = createCatalog(() => now);
  const details = createSalonDetails(catalog, () => now);
  for (let i = 0; i < 5; i++) {
    now += 7 * DRIFT_MS;
    const p = details.page("s1");
    assert.equal(p.barbers[0].queue!.peopleAhead, p.summary.queue.people_ahead + 2);
    assert.equal(p.barbers[1].queue!.peopleAhead, p.summary.queue.people_ahead);
  }
});

test("generated salons: services follow prices, rating-less salons have no reviews", () => {
  const d = createSalonDetails(createCatalog());
  assert.deepEqual(d.page("s2").serviceGroups.flatMap((g) => g.services.map((s) => s.price)), [60, 60]);
  assert.deepEqual(d.page("s6").reviews, []);
  assert.equal(d.page("s6").ratingBreakdown, null);
});
