import assert from "node:assert/strict";
import { test } from "node:test";
import {
  checkPasswordCriteria,
  isValidEmail,
  isValidOtp,
  formatLocalEgyptianPhone,
  normalizeEgyptianPhone,
  validateEgyptianPhone,
} from "./auth-validation.utils.ts";

test("isValidEmail checks standard emails", () => {
  assert.equal(isValidEmail("karim.mostafa@gmail.com"), true);
  assert.equal(isValidEmail("not-an-email"), false);
  assert.equal(isValidEmail("test@domain"), false);
});

test("validateEgyptianPhone accepts every common way of typing the same mobile", () => {
  for (const input of [
    "01012345678",
    "1012345678",
    "201012345678",
    "+201012345678",
    "00201012345678",
    "+20 10 1234 5678",
    "0101-234-5678",
  ]) {
    const result = validateEgyptianPhone(input);
    assert.equal(result.isValid, true, input);
    assert.equal(result.e164, "+201012345678", input);
    assert.equal(result.local, "01012345678", input);
  }
});

test("validateEgyptianPhone reports short, long, wrong-prefix and foreign numbers", () => {
  const short = validateEgyptianPhone("10123456");
  assert.equal(short.isValid, false);
  assert.ok(short.errorMessage?.includes("ناقص"));

  const long = validateEgyptianPhone("0101234567899");
  assert.equal(long.isValid, false);
  assert.ok(long.errorMessage?.includes("أطول"));

  const badPrefix = validateEgyptianPhone("01312345678");
  assert.equal(badPrefix.isValid, false);
  assert.ok(badPrefix.errorMessage?.includes("010"));

  const foreign = validateEgyptianPhone("+441234567890");
  assert.equal(foreign.isValid, false);
  assert.ok(foreign.errorMessage?.includes("مصري"));

  assert.equal(validateEgyptianPhone("").errorMessage, "اكتب رقم الموبايل");
});

test("normalizeEgyptianPhone and formatLocalEgyptianPhone", () => {
  assert.equal(normalizeEgyptianPhone("01512345678"), "+201512345678");
  assert.equal(normalizeEgyptianPhone("123"), null);
  assert.equal(formatLocalEgyptianPhone("+201012345678"), "01012345678");
  assert.equal(formatLocalEgyptianPhone("abc"), "abc");
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

test("isValidOtp validates exactly the expected number of digits (6 by default)", () => {
  assert.equal(isValidOtp("492013"), true);
  assert.equal(isValidOtp("12345"), false);
  assert.equal(isValidOtp("1234567"), false);
  assert.equal(isValidOtp("abc123"), false);
  assert.equal(isValidOtp("4920", 4), true);
});
