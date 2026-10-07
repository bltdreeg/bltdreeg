import assert from "node:assert/strict";
import { test } from "node:test";
import { readMigrated, type PrefStore } from "./migrate-pref.ts";

const store = (init: Record<string, string> = {}): PrefStore & { data: Record<string, string> } => {
  const data = { ...init };
  return {
    data,
    get: async (k) => data[k] ?? null,
    set: async (k, v) => void (data[k] = v),
    remove: async (k) => void delete data[k],
  };
};

test("old SecureStore value moves to kv once", async () => {
  const kv = store();
  const legacy = store({ area: "dokki" });
  assert.equal(await readMigrated("area", kv, legacy), "dokki");
  assert.deepEqual(kv.data, { area: "dokki" });
  assert.deepEqual(legacy.data, {});
});

test("kv wins when both have a value", async () => {
  const kv = store({ area: "maadi" });
  const legacy = store({ area: "dokki" });
  assert.equal(await readMigrated("area", kv, legacy), "maadi");
  assert.deepEqual(legacy.data, { area: "dokki" });
});

test("nothing anywhere → null, nothing written", async () => {
  const kv = store();
  assert.equal(await readMigrated("area", kv, store()), null);
  assert.deepEqual(kv.data, {});
});

test("legacy read failing → treated as empty", async () => {
  const legacy: PrefStore = { get: () => Promise.reject(new Error("keystore")), set: async () => {}, remove: async () => {} };
  assert.equal(await readMigrated("area", store(), legacy), null);
});
