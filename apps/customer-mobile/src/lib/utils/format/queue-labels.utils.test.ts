import { test } from "node:test";
import assert from "node:assert/strict";
import { chairsActive, selectionCount } from "./queue-labels.utils.ts";

test("selectionCount", () => {
  assert.equal(selectionCount(0), "اختار خدمة");
  assert.equal(selectionCount(1), "خدمة واحدة");
  assert.equal(selectionCount(2), "خدمتين");
  assert.equal(selectionCount(3), "3 خدمات");
  assert.equal(selectionCount(10), "10 خدمات");
  assert.equal(selectionCount(11), "11 خدمة");
});

test("chairsActive", () => {
  assert.equal(chairsActive(1), "كرسي واحد شغّال");
  assert.equal(chairsActive(2), "كرسيين شغّالين");
  assert.equal(chairsActive(3), "3 كراسي شغّالة");
});
