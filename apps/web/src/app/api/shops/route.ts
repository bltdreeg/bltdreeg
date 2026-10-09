// قائمة المحلات: بحث وفلترة
import type { NextRequest } from "next/server";
import { shops } from "@/lib/data/shops.constants";
import { ShopSort, type ShopFilters } from "@/lib/types/shop/shop-filters.interface";
import { filterShops } from "@/lib/utils/filter-shops.utils";

const SORTS = new Set<string>(Object.values(ShopSort));

const num = (v: string | null) => {
  if (v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
};

export async function GET(request: NextRequest) {
  const p = request.nextUrl.searchParams;
  const sort = p.get("sort");

  const filters: ShopFilters = {
    q: p.get("q") ?? undefined,
    cityId: p.get("city") ?? undefined,
    maxPrice: num(p.get("maxPrice")),
    maxDistanceKm: num(p.get("maxDistance")),
    todayOnly: p.get("today") === "true",
    services: p.getAll("service"),
    sort: sort && SORTS.has(sort) ? (sort as ShopSort) : undefined,
  };

  return Response.json(filterShops(shops, filters));
}
