// المفضلة (محتاجة تسجيل دخول) — بتتنادى من React Query hooks بس
import { apiClient } from "@/lib/api";

export async function getFavoriteIds(): Promise<string[]> {
  return apiClient.get<string[]>("/favorites");
}

export async function setFavorite(salonId: string, favorite: boolean): Promise<void> {
  const url = `/favorites/${encodeURIComponent(salonId)}`;
  await (favorite ? apiClient.put(url) : apiClient.delete(url));
}
