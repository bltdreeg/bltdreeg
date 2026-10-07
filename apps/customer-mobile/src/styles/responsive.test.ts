import assert from "node:assert/strict";
import { test } from "node:test";
import { breakpointOf, metrics } from "./responsive.ts";

test("breakpoints follow the device classes", () => {
  assert.equal(breakpointOf(320), "compact");
  assert.equal(breakpointOf(375), "regular");
  assert.equal(breakpointOf(430), "large");
  assert.equal(breakpointOf(820), "tablet");
});

test("font size is the design size at 390 and clamped elsewhere", () => {
  assert.equal(metrics(390, 844).fontSize(16), 16);
  assert.ok(metrics(320, 568).fontSize(16) >= 16 * 0.9);
  assert.equal(metrics(1024, 1366).fontSize(20), 23); // 1.15× cap
});

test("gutter and content width per class", () => {
  assert.equal(metrics(340, 640).gutter, 16);
  assert.equal(metrics(393, 852).formMaxWidth, 393);
  assert.equal(metrics(820, 1180).listMaxWidth, 720);
  assert.equal(metrics(375, 667).isShort, true);
});
