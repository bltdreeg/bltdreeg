// قائمة المدن + المدينة المختارة للمستخدم، محفوظة في localStorage
import { useQuery } from "@tanstack/react-query";
import { useCallback, useSyncExternalStore } from "react";
import { API_CITIES } from "@/lib/data/constants/api-routes.constants";
import { CITY_STORAGE_KEY } from "@/lib/data/constants/app.constants";
import { QK_CITIES } from "@/lib/data/constants/query-keys.constants";
import type { City } from "@/lib/types/city/city.interface";
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
const readCityId = () => {
  try {
    return localStorage.getItem(CITY_STORAGE_KEY);
  } catch {
    return null;
  }
};

export function useCity() {
  const citiesQuery = useQuery<City[]>({ queryKey: QK_CITIES, queryFn: () => fetcher<City[]>(API_CITIES), staleTime: Infinity });
  const selectedId = useSyncExternalStore(subscribe, readCityId, () => null);
  const selected = citiesQuery.data?.find((c) => c.id === selectedId) ?? null;

  const setCity = useCallback((id: string) => {
    try {
      localStorage.setItem(CITY_STORAGE_KEY, id);
    } catch {}
    listeners.forEach((cb) => cb());
  }, []);

  return { cities: citiesQuery.data ?? [], isLoading: citiesQuery.isLoading, selected, setCity };
}
