import assert from "node:assert/strict";
import { test } from "node:test";
import type { ResolvedLocation } from "../../types/geo/geo.interface.ts";
import { isInEgypt, toConfirmPayload } from "./location-choice.ts";

const prefill = (source: ResolvedLocation["source"]): ResolvedLocation => ({
  governorate: { id: "EG01", name: "Cairo" },
  city: { id: "EG0111", name: "Qasr Al-Nile" },
  lat: 30.0444,
  lng: 31.2357,
  source,
});

test("gps and ip prefills send their point so the server can keep it", () => {
  assert.deepEqual(toConfirmPayload("EG011102", prefill("gps")), { cityId: "EG011102", lat: 30.0444, lng: 31.2357, source: "gps" });
  assert.deepEqual(toConfirmPayload("EG011103", prefill("ip")), { cityId: "EG011103", lat: 30.0444, lng: 31.2357, source: "ip" });
});

test("default prefill sends only the city (server uses its centroid)", () => {
  assert.deepEqual(toConfirmPayload("EG011103", prefill("default")), { cityId: "EG011103" });
});

test("a maps_url prefill is not resent as a source the confirm endpoint rejects", () => {
  assert.deepEqual(toConfirmPayload("EG011103", prefill("maps_url")), { cityId: "EG011103" });
});

test("egypt bounds", () => {
  assert.equal(isInEgypt(30.0444, 31.2357), true);
  assert.equal(isInEgypt(51.5074, -0.1278), false);
  assert.equal(isInEgypt(21.5, 24.5), true);
  assert.equal(isInEgypt(21.49, 30), false);
});
