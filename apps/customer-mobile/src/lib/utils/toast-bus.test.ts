import assert from "node:assert/strict";
import { test } from "node:test";
import { onToast, showToast } from "./toast-bus.ts";

test("showToast reaches the host, and is a no-op after it unsubscribes", () => {
  const seen: [string, unknown][] = [];
  const off = onToast((key, values) => seen.push([key, values]));
  showToast("area.located", { area: "دجلة" });
  off();
  showToast("common.cantOpenApp");
  assert.deepEqual(seen, [["area.located", { area: "دجلة" }]]);
});

test("an old host unsubscribing doesn't remove the new one", () => {
  const seen: string[] = [];
  const offOld = onToast(() => seen.push("old"));
  onToast(() => seen.push("new"));
  offOld();
  showToast("x");
  assert.deepEqual(seen, ["new"]);
});
