import assert from "node:assert/strict";
import { test } from "node:test";
import { branchDirectionsUrl } from "./branch-links.ts";

test("uses the salon's own maps link when there is one", () => {
  assert.equal(branchDirectionsUrl({ mapsUrl: "https://maps.app.goo.gl/x", lat: 30, lng: 31 }), "https://maps.app.goo.gl/x");
});

test("falls back to a coordinates search", () => {
  assert.equal(
    branchDirectionsUrl({ mapsUrl: null, lat: 30.0444, lng: 31.2357 }),
    "https://www.google.com/maps/search/?api=1&query=30.0444,31.2357",
  );
});
