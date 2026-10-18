import assert from "node:assert/strict";
import { test } from "node:test";
import { toUpdateProfileDto, type ProfileFormValues } from "./profile-update.ts";

const initial: ProfileFormValues = {
  firstName: "Karim",
  lastName: "Mostafa",
  email: "karim@example.com",
  birthDate: "1996-03-14",
};

test("unchanged values send an empty update", () => {
  assert.deepEqual(toUpdateProfileDto({ ...initial }, initial), {});
});

test("only changed fields are sent, trimmed", () => {
  assert.deepEqual(toUpdateProfileDto({ ...initial, firstName: "  Kareem " }, initial), { firstName: "Kareem" });
});

test("email compares case-insensitively and is lowercased", () => {
  assert.deepEqual(toUpdateProfileDto({ ...initial, email: "KARIM@example.com" }, initial), {});
  assert.deepEqual(toUpdateProfileDto({ ...initial, email: "New@Example.com" }, initial), {
    email: "new@example.com",
  });
});

test("clearing email or birth date sends null", () => {
  assert.deepEqual(toUpdateProfileDto({ ...initial, email: " ", birthDate: "" }, initial), {
    email: null,
    birthDate: null,
  });
});
