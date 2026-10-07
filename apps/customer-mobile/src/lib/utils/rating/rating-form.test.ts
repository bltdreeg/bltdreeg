import assert from "node:assert/strict";
import { test } from "node:test";
import { EMPTY_RATING, setOverall } from "./rating-form.ts";

test("overall pre-fills only untouched details", () => {
  const first = setOverall({ ...EMPTY_RATING, cleanliness: 2 }, 4);
  assert.deepEqual([first.overall, first.quality, first.cleanliness, first.timeAccuracy], [4, 4, 2, 4]);
  const again = setOverall(first, 5);
  assert.deepEqual([again.overall, again.quality, again.cleanliness, again.timeAccuracy], [5, 4, 2, 4]);
});
