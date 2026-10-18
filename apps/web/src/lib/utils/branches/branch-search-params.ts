// الفلاتر في URL صفحة البحث (?q=&sort=&maxPrice=&governorate=&city=) ⇄ BranchFilters
import type { BranchFilters, BranchSort } from "../../types/branch/index.ts";

const SORTS: readonly BranchSort[] = ["nearest", "price", "newest"];

type ParamsReader = { get(name: string): string | null };

export function parseBranchSearchParams(params: ParamsReader): BranchFilters {
  const filters: BranchFilters = {};
  const q = params.get("q")?.trim();
  if (q) filters.q = q;

  const sort = params.get("sort");
  if (sort && (SORTS as readonly string[]).includes(sort)) filters.sort = sort as BranchSort;

  const maxPrice = Number(params.get("maxPrice"));
  if (params.get("maxPrice") && Number.isFinite(maxPrice) && maxPrice > 0) filters.maxPrice = maxPrice;

  const governorateId = params.get("governorate");
  if (governorateId) filters.governorateId = governorateId;
  // المدينة من غير محافظة ملهاش معنى في الفلتر (القائمة بتتحمّل من المحافظة)
  const cityId = params.get("city");
  if (cityId && governorateId) filters.cityId = cityId;

  return filters;
}

/** بيرجّع query string مرتبة (من غير "?") — القيم الافتراضية مبتتكتبش عشان اللينكات تفضل نضيفة */
export function toBranchSearchQuery(filters: BranchFilters): string {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.sort && filters.sort !== "nearest") params.set("sort", filters.sort);
  if (filters.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters.governorateId) {
    params.set("governorate", filters.governorateId);
    if (filters.cityId) params.set("city", filters.cityId);
  }
  return params.toString();
}

/** عدد الفلاتر المفعّلة (من غير البحث والترتيب) — للشارة على زرار الفلاتر */
export function activeBranchFilterCount(filters: BranchFilters): number {
  return [filters.maxPrice, filters.governorateId, filters.cityId].filter(Boolean).length;
}
