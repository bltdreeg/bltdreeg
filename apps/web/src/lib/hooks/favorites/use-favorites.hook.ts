"use client";

// المفضلة محلياً في localStorage لحد ما يبقى فيه API — useSyncExternalStore بدل مزامنة الحالة في effect
import { useCallback, useSyncExternalStore } from "react";
import { currentUser } from "@/lib/data/user.constants";

const STORAGE_KEY = "bltdreeg_favorite_shops";
const DEFAULT_IDS: string[] = currentUser.favoriteShopIds ?? [];

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function readRaw(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    // التخزين ممكن يكون مقفول في التصفح الخاص
    return null;
  }
}

// getSnapshot لازم يرجّع نفس المرجع طول ما القيمة متغيرتش
let cachedRaw: string | null = null;
let cachedIds: string[] = DEFAULT_IDS;

function getSnapshot(): string[] {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedIds = raw ? (JSON.parse(raw) as string[]) : DEFAULT_IDS;
    } catch {
      cachedIds = DEFAULT_IDS;
    }
  }
  return cachedIds;
}

const getServerSnapshot = () => DEFAULT_IDS;

function writeIds(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Ignore storage errors
  }
  listeners.forEach((callback) => callback());
}

export function useFavorites() {
  const favoriteIds = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = useCallback((shopId: string) => favoriteIds.includes(shopId), [favoriteIds]);

  const toggleFavorite = useCallback(
    (shopId: string) => {
      writeIds(favoriteIds.includes(shopId) ? favoriteIds.filter((id) => id !== shopId) : [...favoriteIds, shopId]);
    },
    [favoriteIds],
  );

  const removeFavorite = useCallback(
    (shopId: string) => writeIds(favoriteIds.filter((id) => id !== shopId)),
    [favoriteIds],
  );

  return {
    favoriteIds,
    favoriteCount: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}
