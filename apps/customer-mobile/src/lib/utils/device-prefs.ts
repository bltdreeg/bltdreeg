// تفضيلات الجهاز اللي مش سرية (المنطقة، الإشعارات، آخر بحث…) في expo-sqlite/kv-store — SecureStore للتوكن بس
import * as SecureStore from "expo-secure-store";
import Storage from "expo-sqlite/kv-store";
import { readMigrated, type PrefStore } from "./migrate-pref";

const kv: PrefStore = { get: (k) => Storage.getItem(k), set: (k, v) => Storage.setItem(k, v), remove: (k) => Storage.removeItem(k) };
const legacy: PrefStore = { get: (k) => SecureStore.getItemAsync(k), set: (k, v) => SecureStore.setItemAsync(k, v), remove: (k) => SecureStore.deleteItemAsync(k) };

export const readPref = (key: string) => readMigrated(key, kv, legacy);
/** مش لازم await إلا قبل reloadAppAsync */
export const writePref = (key: string, value: string) => Storage.setItem(key, value).catch(() => {});
export const removePref = (key: string) => Storage.removeItem(key).catch(() => {});
