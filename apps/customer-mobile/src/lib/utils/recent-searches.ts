// آخر عمليات بحث (فريم 12) — زي SearchHistoryRepositoryImpl في Flutter: ٦ بالأحدث، من غير تكرار. محفوظة على الجهاز.
import { useSyncExternalStore } from "react";
import { readPref, writePref } from "./device-prefs";

const KEY = "beltadreeg_recent_searches";
const MAX = 6;
let recent: string[] = [];
const listeners = new Set<() => void>();

function save(next: string[]) {
  recent = next;
  listeners.forEach((l) => l());
  void writePref(KEY, JSON.stringify(next));
}

export const recentSearches = {
  async load(): Promise<void> {
    try {
      recent = JSON.parse((await readPref(KEY)) ?? "[]");
    } catch {
      recent = [];
    }
    listeners.forEach((l) => l());
  },
  add(query: string) {
    const q = query.trim();
    if (q) save([q, ...recent.filter((e) => e !== q)].slice(0, MAX));
  },
  remove: (query: string) => save(recent.filter((e) => e !== query)),
  clear: () => save([]),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useRecentSearches = () => useSyncExternalStore(recentSearches.subscribe, () => recent);
