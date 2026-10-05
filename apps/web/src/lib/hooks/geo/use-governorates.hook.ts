"use client";

// قائمة المحافظات — نادراً ما تتغير، فبنكاشها طول الجلسة
import { useQuery } from "@tanstack/react-query";
import { getGovernorates } from "@/lib/actions/geo/geo.action";
import { QK_GEO_GOVERNORATES } from "@/lib/data/constants/query-keys.constants";

export function useGovernorates() {
  return useQuery({ queryKey: QK_GEO_GOVERNORATES, queryFn: getGovernorates, staleTime: Infinity });
}
