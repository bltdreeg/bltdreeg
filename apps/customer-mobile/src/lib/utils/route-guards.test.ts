import assert from "node:assert/strict";
import { test } from "node:test";
import { requiresLogin, safeReturnPath } from "./route-guards.ts";

test("login-required routes match Flutter's protected list", () => {
  for (const p of ["/salon/s1/book/barber", "/salon/s1/book/review", "/booking/b1/confirmed", "/booking/b1/rate", "/booking/b1/rate/sent", "/queue/b1", "/account/profile", "/account/favorites", "/account/notification-settings"]) assert.ok(requiresLogin(p), p);
  for (const p of ["/home", "/salon/s1", "/salon/s1/gallery", "/search", "/bookings", "/account", "/account/language", "/account/help", "/login"]) assert.ok(!requiresLogin(p), p);
});

test("return path only allows in-app paths", () => {
  assert.equal(safeReturnPath("/salon/s1"), "/salon/s1");
  assert.equal(safeReturnPath("//evil.com"), null);
  assert.equal(safeReturnPath("https://x"), null);
  assert.equal(safeReturnPath(undefined), null);
});
