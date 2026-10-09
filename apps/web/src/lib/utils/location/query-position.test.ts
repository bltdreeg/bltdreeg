import assert from "node:assert/strict";
import { test } from "node:test";
import { toQueryPosition } from "./query-position.ts";

test("rounds to 3 decimals", () => {
  assert.deepEqual(toQueryPosition({ lat: 30.044412, lng: 31.235712 }), { lat: 30.044, lng: 31.236 });
});

test("errors, missing data and points outside egypt give null (server falls back to ip)", () => {
  assert.equal(toQueryPosition(undefined), null);
  assert.equal(toQueryPosition({ error: "denied" }), null);
  assert.equal(toQueryPosition({ lat: 51.5, lng: -0.12 }), null);
});
