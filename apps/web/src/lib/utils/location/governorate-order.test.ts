import assert from "node:assert/strict";
import { test } from "node:test";
import { orderGovernorates } from "./governorate-order.ts";

test("cairo, giza and alexandria come first, the rest keep their order", () => {
  const ids = orderGovernorates(["EG28", "EG02", "EG18", "EG01", "EG12", "EG21"].map((id) => ({ id }))).map((g) => g.id);
  assert.deepEqual(ids, ["EG01", "EG21", "EG02", "EG28", "EG18", "EG12"]);
});

test("does not mutate the input", () => {
  const input = [{ id: "EG21" }, { id: "EG01" }];
  orderGovernorates(input);
  assert.deepEqual(input, [{ id: "EG21" }, { id: "EG01" }]);
});
