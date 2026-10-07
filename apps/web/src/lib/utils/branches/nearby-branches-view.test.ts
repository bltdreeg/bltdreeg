import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveNearbyBranchesView } from "./nearby-branches-view.ts";

const page = (ids: string[]) => ({ items: ids.map((id) => ({ id })) });

test("still loading: no pages fetched yet", () => {
  const view = resolveNearbyBranchesView({ pending: true, isError: false, pages: [], lastGoodPages: null });
  assert.deepEqual(view, { kind: "loading" });
});

test("fresh success with items: shows them, not stale", () => {
  const pages = [page(["1", "2"])];
  const view = resolveNearbyBranchesView({ pending: false, isError: false, pages, lastGoodPages: null });
  assert.deepEqual(view, { kind: "pages", pages, stale: false });
});

test("fresh success with no branches: empty", () => {
  const view = resolveNearbyBranchesView({ pending: false, isError: false, pages: [page([])], lastGoodPages: null });
  assert.deepEqual(view, { kind: "empty" });
});

// الحالة المهمة: الطلب بالـ GPS فشل بعد ما كانت عندنا قائمة كويسة من الـ IP — نفضل نوريها، منمسحهاش بـ error
test("a failed gps refetch keeps showing the last good (ip) list, marked stale", () => {
  const lastGoodPages = [page(["1", "2"])];
  const view = resolveNearbyBranchesView({ pending: false, isError: true, pages: [], lastGoodPages });
  assert.deepEqual(view, { kind: "pages", pages: lastGoodPages, stale: true });
});

test("a failed request with nothing good to fall back on shows the error state", () => {
  const view = resolveNearbyBranchesView({ pending: false, isError: true, pages: [], lastGoodPages: null });
  assert.deepEqual(view, { kind: "error" });
});

test("a failed request with an empty last-good page also shows the error state", () => {
  const view = resolveNearbyBranchesView({ pending: false, isError: true, pages: [], lastGoodPages: [page([])] });
  assert.deepEqual(view, { kind: "error" });
});
