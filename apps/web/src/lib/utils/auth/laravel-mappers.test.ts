import assert from "node:assert/strict";
import { test } from "node:test";
import { identifierField, mapCustomer, mapOtpChallenge, mapResolvedLocation, type RawCustomer } from "./laravel-mappers.ts";

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
    birth_date: null,
    has_password: true,
    social_providers: ["google"],
    location: {
      lat: 30.04,
      lng: 31.23,
      source: "gps",
      updated_at: "2026-01-01T00:00:00Z",
      confirmed: true,
      governorate: { id: "EG01", name: "القاهرة" },
      city: { id: "EG0111", name: "قسم قصر النيل" },
      area: { id: "EG011103", name: "قصرالدوبارة" },
    },
    onboarding: { complete: false, missing: ["terms"], skippable: ["birth_date"] },
  };
  const user = mapCustomer(raw);
  assert.equal(user.firstName, "أحمد");
  assert.equal(user.location.updatedAt, "2026-01-01T00:00:00Z");
  assert.equal(user.location.confirmed, true);
  assert.deepEqual(user.location.governorate, { id: "EG01", name: "القاهرة" });
  assert.equal(user.location.area.id, "EG011103");
  assert.deepEqual(user.onboarding.missing, ["terms"]);
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

test("mapResolvedLocation keeps the three divisions, point and source", () => {
  const location = mapResolvedLocation({
    governorate: { id: "EG02", name: "Alexandria" },
    city: { id: "EG0204", name: "Bab Sharqi" },
    area: { id: "EG020405", name: "Shiakhet Bab Sharqi" },
    lat: 31.2001,
    lng: 29.9187,
    source: "ip",
  });
  assert.equal(location.city.id, "EG0204");
  assert.equal(location.source, "ip");
  assert.equal(location.lat, 31.2001);
});
