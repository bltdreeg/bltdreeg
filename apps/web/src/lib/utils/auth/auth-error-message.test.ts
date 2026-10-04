import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError } from "../api/api-error.ts";
import { apiFieldErrors, authErrorMessage } from "./auth-error-message.ts";

test("otp_invalid shows the attempts left", () => {
  const e = new ApiError(422, "auth.otp_invalid", "x", { attemptsLeft: 3 });
  assert.equal(authErrorMessage(e), "الكود غلط، فاضلك 3 محاولات.");
  assert.equal(authErrorMessage(new ApiError(422, "auth.otp_invalid", "x", { attemptsLeft: 1 })), "الكود غلط، فاضلك 1 محاولة.");
  assert.equal(authErrorMessage(new ApiError(422, "auth.otp_invalid", "server text", { attemptsLeft: 0 })), "server text");
});

test("lock, cooldown and rate limit use the numbers from the API", () => {
  assert.match(authErrorMessage(new ApiError(422, "auth.otp_locked", "x", { lockMinutes: 15 })), /15 دقيقة/);
  assert.match(authErrorMessage(new ApiError(422, "auth.otp_resend_too_soon", "x", { retryAfterSeconds: 42 })), /42 ثانية/);
  assert.match(authErrorMessage(new ApiError(429, "auth.otp_send_limit", "x", { retryAfterSeconds: 100 })), /2 دقيقة/);
});

test("validation errors use the first field message, network errors a friendly text", () => {
  const e = new ApiError(422, "validation.failed", "invalid", {}, { phone: ["bad phone"], password: ["short"] });
  assert.equal(authErrorMessage(e), "bad phone");
  assert.deepEqual(apiFieldErrors(e), { phone: "bad phone", password: "short" });
  assert.match(authErrorMessage(new ApiError(0, "http.network", "Network Error")), /النت/);
});

test("unknown codes fall back to the server message", () => {
  assert.equal(authErrorMessage(new ApiError(422, "auth.invalid_credentials", "بيانات غلط")), "بيانات غلط");
});

test("5xx errors never show internal details to the user", () => {
  const e = new ApiError(500, "http.error", "SQLSTATE[HY000] [2002] connection refused");
  assert.ok(!authErrorMessage(e).includes("SQLSTATE"));
  assert.match(authErrorMessage(e), /حاول تاني/);
  assert.match(authErrorMessage(new ApiError(503, "auth.delivery_failed", "x")), /حاول تاني/);
});
