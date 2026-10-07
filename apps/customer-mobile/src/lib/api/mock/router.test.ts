import assert from "node:assert/strict";
import { test } from "node:test";
import { matchRoute, route } from "./router.ts";

const a = () => "a";
const b = () => "b";
const routes = [route("GET", "/salons", a), route("GET", "/salons/:id", b), route("POST", "/salons/:id", a)];

test("matches static and param routes by method", () => {
  assert.equal(matchRoute(routes, "get", "/salons?sort=wait")?.handler, a);
  assert.deepEqual(matchRoute(routes, "GET", "/salons/s%201")?.params, { id: "s 1" });
  assert.equal(matchRoute(routes, "POST", "/salons/7")?.handler, a);
});

test("no match on unknown path, extra segments or method", () => {
  assert.equal(matchRoute(routes, "GET", "/salons/1/reviews"), null);
  assert.equal(matchRoute(routes, "DELETE", "/salons/1"), null);
});
