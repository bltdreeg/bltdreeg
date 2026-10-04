import assert from "node:assert/strict";
import { test } from "node:test";
import type { CustomerOnboarding } from "../../types/auth/customer.interface.ts";
import { afterAuthPath, safeCallback } from "./post-auth-redirect.ts";

const done: { onboarding: CustomerOnboarding } = { onboarding: { complete: true, missing: [], skippable: [] } };
const optional: { onboarding: CustomerOnboarding } = { onboarding: { complete: true, missing: [], skippable: ["location"] } };
const incomplete: { onboarding: CustomerOnboarding } = { onboarding: { complete: false, missing: ["phone"], skippable: [] } };

test("safeCallback only allows same-site relative paths", () => {
  assert.equal(safeCallback("/book/1?x=2"), "/book/1?x=2");
  assert.equal(safeCallback("//evil.com"), null);
  assert.equal(safeCallback("/\evil.com"), null);
  assert.equal(safeCallback("https://evil.com"), null);
  assert.equal(safeCallback(""), null);
  assert.equal(safeCallback(undefined), null);
});

test("complete accounts go back to the callback or home", () => {
  assert.equal(afterAuthPath(done, "/book/1"), "/book/1");
  assert.equal(afterAuthPath(done, "//evil.com"), "/");
  assert.equal(afterAuthPath(optional, null), "/");
});

test("incomplete accounts, and new accounts with optional steps, go to onboarding", () => {
  assert.equal(afterAuthPath(incomplete, "/book/1"), "/onboarding?callbackUrl=%2Fbook%2F1");
  assert.equal(afterAuthPath(optional, null, { isNewAccount: true }), "/onboarding?callbackUrl=%2F");
  assert.equal(afterAuthPath(done, null, { isNewAccount: true }), "/");
});
