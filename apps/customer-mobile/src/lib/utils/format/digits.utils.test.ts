import assert from "node:assert/strict";
import { test } from "node:test";
import { onlyDigits, toLatinDigits } from "./digits.utils.ts";

test("arabic-indic and persian digits become latin", () => {
  assert.equal(toLatinDigits("٠١٠٢ ٣٤٥ ٦٧٨٩"), "0102 345 6789");
  assert.equal(toLatinDigits("۴٫۸"), "4.8");
  assert.equal(onlyDigits("+٢٠ 10-23"), "201023");
});
