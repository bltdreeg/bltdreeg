import assert from "node:assert/strict";
import { test } from "node:test";
import { mapSalonSummary } from "../../../lib/utils/salons/salon-mappers.ts";
import { createCatalog } from "../../../lib/api/mock/salons.mock.ts";
import { homeSections } from "./home-sections.ts";

const now = Date.UTC(2026, 9, 7, 6);
const salons = createCatalog(() => now).salons("maadi").map(mapSalonSummary);

test("board order on the seeded catalog", () => {
  const h = homeSections(salons, "leastWait", now);
  assert.deepEqual(h.availableNow.map((s) => s.id), ["s1", "s6", "s2", "s3"]);
  assert.ok(h.recommended.every((s) => s.rating !== null && s.distanceKm <= 5));
  assert.deepEqual(h.newInArea.map((s) => s.id), ["s6", "s7"]);
  assert.equal(h.lastSeen[0].id, "s1");
  assert.ok(!h.lastSeen.some((s) => s.distanceKm > 5));
});

test("chips re-sort recommended", () => {
  assert.equal(homeSections(salons, "topRated", now).recommended[0].id, "s5");
  assert.equal(homeSections(salons, "cheapest", now).recommended[0].id, "s4");
});

test("last seen puts opened salons first, then the nearest", () => {
  assert.deepEqual(homeSections(salons, "leastWait", now, ["s5", "s9"]).lastSeen.map((s) => s.id), ["s5", "s9", "s1", "s3", "s2"]);
});
