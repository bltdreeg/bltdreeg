import assert from "node:assert/strict";
import { test } from "node:test";
import { authRoutes, DEMO } from "./auth.mock.ts";
import { matchRoute, MockHttpError } from "./router.ts";

const call = (method: string, path: string, body: Record<string, unknown> = {}, token: string | null = null) => {
  const m = matchRoute(authRoutes, method, path)!;
  return m.handler({ params: m.params, query: {}, body, locale: "ar", token }) as Record<string, unknown>;
};
const code = (c: string) => (e: unknown) => e instanceof MockHttpError && e.body.code === c;

test("forgot password: code → reset token → new password signs in; the token is single-use", () => {
  assert.throws(() => call("POST", "/auth/password/forgot", { phone: "01099999999" }), code("auth.account_not_found"));
  assert.equal(call("POST", "/auth/password/forgot", { phone: DEMO.phone }).purpose, "reset_password");
  assert.throws(() => call("POST", "/auth/password/verify", { phone: DEMO.phone, code: "0000" }), code("auth.otp_invalid"));
  const { reset_token } = call("POST", "/auth/password/verify", { phone: DEMO.phone, code: DEMO.otp });
  const body = { reset_token, password: "newpass99", password_confirmation: "newpass99" };
  assert.ok(call("POST", "/auth/password/reset", body).access_token);
  assert.throws(() => call("POST", "/auth/password/reset", body), code("auth.reset_token_invalid"));
  assert.throws(() => call("POST", "/auth/login", { phone: DEMO.phone, password: DEMO.password }), code("auth.invalid_credentials"));
  assert.ok(call("POST", "/auth/login", { phone: DEMO.phone, password: "newpass99" }).access_token);
});
