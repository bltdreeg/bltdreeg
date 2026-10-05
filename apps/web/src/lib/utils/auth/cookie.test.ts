import assert from "node:assert/strict";
import { test } from "node:test";
import { expireCookie, readCookie, serializeCookie } from "./cookie.ts";

test("serializeCookie builds a lax cookie and honours maxAge and secure", () => {
  assert.equal(serializeCookie("a", "b c"), "a=b%20c; Path=/; SameSite=Lax");
  assert.equal(
    serializeCookie("a", "1", { maxAge: 60, secure: true }),
    "a=1; Path=/; SameSite=Lax; Max-Age=60; Secure",
  );
});

test("readCookie finds a cookie among others and decodes it", () => {
  assert.equal(readCookie("x=1; beltadreeg_session=ab%20c; y=2", "beltadreeg_session"), "ab c");
  assert.equal(readCookie("x=1", "missing"), null);
  assert.equal(readCookie("t=a=b", "t"), "a=b");
});

test("expireCookie zeroes the max age", () => {
  assert.match(expireCookie("a"), /Max-Age=0/);
});
