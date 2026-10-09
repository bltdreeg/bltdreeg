import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldRefetchPosition, visitorListSettled } from "./visitor-list-state.ts";

// Review Focus 1: الزائر لسه ماردّش على الإذن — القائمة من الـ IP لازم تظهر فورًا
test("settled while the prompt is open (ip list can load right away)", () => {
  assert.equal(visitorListSettled("prompt", false), true);
  assert.equal(visitorListSettled("prompt", true), true);
});

// Review Focus 2: سمح قبل كده (من زيارة سابقة) — نستنى الإحداثيات، طلب واحد بس
test("not settled while granted and the position request is still pending", () => {
  assert.equal(visitorListSettled("granted", true), false);
});

test("settled once granted and the position request finished", () => {
  assert.equal(visitorListSettled("granted", false), true);
});

test("settled when denied (the browser will not ask again) or unsupported", () => {
  assert.equal(visitorListSettled("denied", false), true);
  assert.equal(visitorListSettled("unsupported", false), true);
});

test("not settled while the permission check itself is still running", () => {
  assert.equal(visitorListSettled(null, false), false);
});

// Review Focus 3: رفض الـ prompt وبعدين سمح من إعدادات المتصفح — نجيب الموقع تاني
test("refetches only when permission is granted after a failed attempt", () => {
  assert.equal(shouldRefetchPosition("granted", true), true);
  assert.equal(shouldRefetchPosition("granted", false), false);
  assert.equal(shouldRefetchPosition("prompt", true), false);
  assert.equal(shouldRefetchPosition("denied", true), false);
});
