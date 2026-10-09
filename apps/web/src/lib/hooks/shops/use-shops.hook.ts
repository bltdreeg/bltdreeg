// قائمة المحلات مع الفلاتر
import { useQuery } from "@tanstack/react-query";
import { API_SHOPS } from "@/lib/data/constants/api-routes.constants";
import { QK_SHOPS } from "@/lib/data/constants/query-keys.constants";
import type { Shop } from "@/lib/types/shop/shop.interface";
import type { ShopFilters } from "@/lib/types/shop/shop-filters.interface";
import { fetcher } from "@/lib/utils/api/fetcher";

const PARAMS: Record<keyof ShopFilters, string> = {
  q: "q",
  cityId: "city",
  maxPrice: "maxPrice",
  maxDistanceKm: "maxDistance",
  todayOnly: "today",
  services: "service",
  sort: "sort",
};

function toQuery(filters: ShopFilters) {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === "" || value === false) continue;
    const param = PARAMS[key as keyof ShopFilters];
    // services مصفوفة — كل خدمة بتضاف كمفتاح منفصل عشان ماتتمسحش القيم التانية
    if (Array.isArray(value)) for (const v of value) p.append(param, String(v));
    else p.set(param, String(value));
  }
  const qs = p.toString();
  return qs ? `${API_SHOPS}?${qs}` : API_SHOPS;
}

export function useShops(filters: ShopFilters = {}) {
  return useQuery<Shop[]>({
    queryKey: QK_SHOPS(filters),
    queryFn: () => fetcher<Shop[]>(toQuery(filters)),
  });
}
