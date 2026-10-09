import assert from "node:assert/strict";
import { test } from "node:test";
import { identifierField, mapCustomer, mapOtpChallenge, type RawCustomer } from "./laravel-mappers.ts";

test("identifierField maps emails and phones", () => {
  assert.deepEqual(identifierField(" A@X.com "), { email: "a@x.com" });
  assert.deepEqual(identifierField("01012345678"), { phone: "01012345678" });
});

test("mapCustomer converts snake_case and never carries tokens", () => {
  const raw: RawCustomer = {
    id: "01J9Z",
    first_name: "أحمد",
    last_name: "سامي",
    phone: "01012345678",
    phone_verified: true,
    email: null,
    email_verified: false,
    pending_email: "p@x.com",
    birth_date: null,
    has_password: true,
    social_providers: ["google"],
    location: { lat: 30.04, lng: 31.23, source: "gps", updated_at: "2026-01-01T00:00:00Z" },
    onboarding: { complete: false, missing: ["terms"], skippable: ["birth_date"] },
  };
  const user = mapCustomer(raw);
  assert.equal(user.firstName, "أحمد");
  assert.equal(user.pendingEmail, "p@x.com");
  assert.equal(user.location?.updatedAt, "2026-01-01T00:00:00Z");
  assert.deepEqual(user.onboarding.missing, ["terms"]);
  assert.equal(mapCustomer({ ...raw, location: null }).location, null);
});

test("mapOtpChallenge fills the missing identifier with null", () => {
  const c = mapOtpChallenge({
    phone: "01012345678",
    purpose: "login",
    channel: "sms",
    code_length: 6,
    expires_at: "a",
    resend_available_at: "b",
    attempts_left: 5,
  });
  assert.equal(c.email, null);
  assert.equal(c.codeLength, 6);
  assert.equal(c.attemptsLeft, 5);
});
