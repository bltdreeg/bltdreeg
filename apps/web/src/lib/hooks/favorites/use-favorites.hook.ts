"use client";

import { useEffect, useState, useCallback } from "react";
import { currentUser } from "@/lib/data/user.constants";

const STORAGE_KEY = "bltdreeg_favorite_shops";

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    currentUser.favoriteShopIds ?? ["shop-2", "shop-1", "shop-5", "shop-16"]
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setFavoriteIds(JSON.parse(stored));
      }
    } catch {
      // Ignore storage errors in private browsing/environments
    }
  }, []);

  const saveFavorites = useCallback((newIds: string[]) => {
    setFavoriteIds(newIds);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newIds));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const isFavorite = useCallback(
    (shopId: string) => favoriteIds.includes(shopId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    (shopId: string) => {
      if (favoriteIds.includes(shopId)) {
        saveFavorites(favoriteIds.filter((id) => id !== shopId));
      } else {
        saveFavorites([...favoriteIds, shopId]);
      }
    },
    [favoriteIds, saveFavorites]
  );

  const removeFavorite = useCallback(
    (shopId: string) => {
      saveFavorites(favoriteIds.filter((id) => id !== shopId));
    },
    [favoriteIds, saveFavorites]
  );

  return {
    favoriteIds,
    favoriteCount: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    removeFavorite,
  };
}

