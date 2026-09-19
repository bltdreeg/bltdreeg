import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkPasswordCriteria,
  isValidEmail,
  isValidOtp,
  validateEgyptianPhone,
} from "./auth-validation.utils.ts";

test("isValidEmail checks standard emails", () => {
  assert.equal(isValidEmail("karim.mostafa@gmail.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail("test@domain"), false);
});

test("validateEgyptianPhone enforces 10 digits starting with 1 after +20", () => {
  const valid = validateEgyptianPhone("1012345678");
  assert.equal(valid.isValid, true);

  const short = validateEgyptianPhone("10123456");
  assert.equal(short.isValid, false);
  assert.ok(short.errorMessage?.includes("ناقص"));

  const invalidStart = validateEgyptianPhone("2012345678");
  assert.equal(invalidStart.isValid, false);
});

test("checkPasswordCriteria validates mobile rules (8 characters + number)", () => {
  const weak = checkPasswordCriteria("short");
  assert.equal(weak.min8, false);
  assert.equal(weak.remainingLength, 3);
  assert.equal(weak.hasNumber, false);
  assert.equal(weak.isValid, false);

  const strong = checkPasswordCriteria("StrongPass123");
  assert.equal(strong.min8, true);
  assert.equal(strong.hasNumber, true);
  assert.equal(strong.isValid, true);
});

test("isValidOtp validates exactly 4 digits", () => {
  assert.equal(isValidOtp("4920"), true);
  assert.equal(isValidOtp("123"), false);
  assert.equal(isValidOtp("12345"), false);
  assert.equal(isValidOtp("abc1"), false);
});

