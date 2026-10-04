import assert from "node:assert/strict";
import { test } from "node:test";
import { guardRedirect, isProtectedPath } from "./route-guard.ts";

const base = { search: "", hasSession: false, needsOnboarding: false };

test("guests browse public pages and get sent to login from protected ones", () => {
  assert.equal(guardRedirect({ ...base, path: "/" }), null);
  assert.equal(guardRedirect({ ...base, path: "/salon/1" }), null);
  assert.deepEqual(guardRedirect({ ...base, path: "/bookings", search: "?x=1" }), { to: "/login", callback: "/bookings?x=1" });
  assert.deepEqual(guardRedirect({ ...base, path: "/onboarding" }), { to: "/login", callback: "/onboarding" });
});

test("a session with missing onboarding is sent to onboarding from protected pages only", () => {
  const s = { ...base, hasSession: true, needsOnboarding: true };
  assert.deepEqual(guardRedirect({ ...s, path: "/book/5" }), { to: "/onboarding", callback: "/book/5" });
  assert.equal(guardRedirect({ ...s, path: "/" }), null);
  assert.equal(guardRedirect({ ...s, path: "/onboarding" }), null);
});

test("auth pages with a session go home (or to onboarding), never loop", () => {
  const s = { ...base, hasSession: true };
  assert.deepEqual(guardRedirect({ ...s, path: "/login" }), { to: "/", callback: null });
  assert.deepEqual(guardRedirect({ ...s, path: "/register", needsOnboarding: true }), { to: "/onboarding", callback: null });
  // صفحات الكود/الاستعادة بتتفتح في نص الفلو، فمش بنحوّل منها
  assert.equal(guardRedirect({ ...s, path: "/verify-otp" }), null);
  assert.equal(guardRedirect({ ...s, path: "/reset-password" }), null);
  // الوجهة "/" نفسها مش محمية، فمفيش لوب لو التوكن اتلغى من السيرفر
  assert.equal(guardRedirect({ ...s, path: "/" }), null);
});

test("isProtectedPath matches sub paths but not prefixes of other words", () => {
  assert.ok(isProtectedPath("/account/profile"));
  assert.ok(!isProtectedPath("/accounting"));
});
