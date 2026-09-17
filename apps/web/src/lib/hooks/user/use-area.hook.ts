// قائمة المناطق + المنطقة المختارة للمستخدم، محفوظة في localStorage
import { useQuery } from "@tanstack/react-query";
import { useCallback, useSyncExternalStore } from "react";
import { API_AREAS } from "@/lib/data/constants/api-routes.constants";
import { AREA_STORAGE_KEY } from "@/lib/data/constants/app.constants";
import { QK_AREAS } from "@/lib/data/constants/query-keys.constants";
import type { Area } from "@/lib/types/area/area.interface";
import { fetcher } from "@/lib/utils/api/fetcher";

const listeners = new Set<() => void>();
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const readAreaId = () => {
  try {
    return localStorage.getItem(AREA_STORAGE_KEY);
  } catch {
    return null;
  }
};

export function useArea() {
  const areasQuery = useQuery<Area[]>({ queryKey: QK_AREAS, queryFn: () => fetcher<Area[]>(API_AREAS), staleTime: Infinity });
  const selectedId = useSyncExternalStore(subscribe, readAreaId, () => null);
  const selected = areasQuery.data?.find((a) => a.id === selectedId) ?? null;

  const setArea = useCallback((id: string) => {
    try {
      localStorage.setItem(AREA_STORAGE_KEY, id);
    } catch {}
    listeners.forEach((cb) => cb());
  }, []);

  return { areas: areasQuery.data ?? [], isLoading: areasQuery.isLoading, selected, setArea };
}
