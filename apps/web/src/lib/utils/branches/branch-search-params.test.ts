import assert from "node:assert/strict";
import { test } from "node:test";
import { activeBranchFilterCount, parseBranchSearchParams, toBranchSearchQuery } from "./branch-search-params.ts";

const parse = (query: string) => parseBranchSearchParams(new URLSearchParams(query));

test("parses supported filters", () => {
  assert.deepEqual(parse("q=%20قص%20&sort=price&maxPrice=100&governorate=EG01&city=EG0111"), {
    q: "قص",
    sort: "price",
    maxPrice: 100,
    governorateId: "EG01",
    cityId: "EG0111",
  });
});

test("ignores unknown sorts, bad prices and a city without a governorate", () => {
  assert.deepEqual(parse("sort=rating&maxPrice=abc&city=EG0111"), {});
  assert.deepEqual(parse("maxPrice=0"), {});
  assert.deepEqual(parse("maxPrice=-5"), {});
});

test("serializes without defaults and round-trips", () => {
  assert.equal(toBranchSearchQuery({ sort: "nearest" }), "");
  const query = toBranchSearchQuery({ q: "Bloom", sort: "newest", maxPrice: 50, governorateId: "EG01", cityId: "EG0111" });
  assert.equal(query, "q=Bloom&sort=newest&maxPrice=50&governorate=EG01&city=EG0111");
  assert.deepEqual(parse(query), { q: "Bloom", sort: "newest", maxPrice: 50, governorateId: "EG01", cityId: "EG0111" });
});

test("a city is dropped when serializing without a governorate", () => {
  assert.equal(toBranchSearchQuery({ cityId: "EG0111" }), "");
});

test("counts active filters but not the query or sort", () => {
  assert.equal(activeBranchFilterCount({ q: "x", sort: "price" }), 0);
  assert.equal(activeBranchFilterCount({ maxPrice: 100, governorateId: "EG01", cityId: "EG0111" }), 3);
});
