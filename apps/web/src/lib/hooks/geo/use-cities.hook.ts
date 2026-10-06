"use client";

// مدن محافظة معيّنة — مفعّل بس لما تتحدد المحافظة
import { useQuery } from "@tanstack/react-query";
import { getCities } from "@/lib/actions/geo/geo.action";
import { QK_GEO_CITIES } from "@/lib/data/constants/query-keys.constants";

export function useCities(governorateId: string | null, enabled = true) {
  return useQuery({
    queryKey: QK_GEO_CITIES(governorateId),
    queryFn: () => getCities(governorateId as string),
    enabled: enabled && !!governorateId,
    staleTime: Infinity,
  });
}
