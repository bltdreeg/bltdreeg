import assert from "node:assert/strict";
import { test } from "node:test";
import { initials } from "./initials.ts";

test("first letter of the first two words, skipping the article", () => {
  assert.equal(initials("كريم عبد الرحمن"), "ك ع");
  assert.equal(initials("محمود السيد"), "م س");
  assert.equal(initials("  أحمد  "), "أ");
  assert.equal(initials("Ali Hassan"), "A H");
  // "ال" alone or a short word keeps its first letter
  assert.equal(initials("ال بال"), "ا ب");
});
