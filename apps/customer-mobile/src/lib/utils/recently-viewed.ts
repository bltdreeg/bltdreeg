// الصالونات اللي اتفتحت، الأحدث الأول — "آخر صالونات شوفتها" في الرئيسية من غير نت (فريم 08)
// ponytail: في الذاكرة بس (الجلسة الحالية) — يتحفظ على الجهاز لو احتجناه بعد ما التطبيق يتقفل
import { useSyncExternalStore } from "react";

const MAX = 10;
let ids: string[] = [];
const listeners = new Set<() => void>();

export const recentlyViewed = {
  ids: () => ids,

  record(id: string): void {
    if (ids[0] === id) return;
    ids = [id, ...ids.filter((x) => x !== id)].slice(0, MAX);
    listeners.forEach((l) => l());
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useRecentlyViewed = () => useSyncExternalStore(recentlyViewed.subscribe, recentlyViewed.ids);
