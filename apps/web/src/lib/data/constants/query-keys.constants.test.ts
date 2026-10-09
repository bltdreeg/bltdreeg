import assert from "node:assert/strict";
import { test } from "node:test";
import { QK_LOCATION_PREFILL, QK_USER } from "./query-keys.constants.ts";

// useUser().refresh() بيعمل invalidate لـ QK_USER، والـ invalidate بيطابق بالبادئة —
// فمفتاح التعبئة المبدئية لازم ميبدأش بيه وإلا الريفرش يعيد طلب إذن الموقع من المتصفح
test("the location prefill key is not matched by invalidating the user key", () => {
  assert.notEqual(QK_LOCATION_PREFILL[0], QK_USER[0]);
});
