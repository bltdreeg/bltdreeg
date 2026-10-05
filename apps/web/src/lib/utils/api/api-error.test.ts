import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError, toApiError } from "./api-error.ts";

test("toApiError reads the Laravel error envelope", () => {
  const err = toApiError(422, {
    message: "الكود غلط",
    code: "auth.otp_invalid",
    data: { attemptsLeft: 3 },
    errors: { code: ["bad"] },
  });
  assert.ok(err instanceof ApiError);
  assert.equal(err.status, 422);
  assert.equal(err.code, "auth.otp_invalid");
  assert.equal(err.message, "الكود غلط");
  assert.deepEqual(err.data, { attemptsLeft: 3 });
  assert.deepEqual(err.errors, { code: ["bad"] });
});

test("toApiError falls back for non-envelope bodies", () => {
  const err = toApiError(502, "<html>bad gateway</html>");
  assert.equal(err.code, "http.error");
  assert.equal(err.message, "HTTP 502");
  assert.deepEqual(err.data, {});
  assert.equal(toApiError(401, null).code, "auth.unauthenticated");
});
