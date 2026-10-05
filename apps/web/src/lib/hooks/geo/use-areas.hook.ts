"use client";

// مناطق مدينة معيّنة — مفعّل بس لما تتحدد المدينة
import { useQuery } from "@tanstack/react-query";
import { getAreas } from "@/lib/actions/geo/geo.action";
import { QK_GEO_AREAS } from "@/lib/data/constants/query-keys.constants";

export function useAreas(cityId: string | null) {
  return useQuery({
    queryKey: QK_GEO_AREAS(cityId),
    queryFn: () => getAreas(cityId as string),
    enabled: !!cityId,
    staleTime: Infinity,
  });
}
