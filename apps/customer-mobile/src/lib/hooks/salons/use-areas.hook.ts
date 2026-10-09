// المناطق (فريم 40) — ثابتة طول الجلسة
import { useQuery } from "@tanstack/react-query";
import { getAreas } from "@/lib/actions/salons/salons.action";
import { QK_AREAS } from "@/lib/data/constants/query-keys.constants";

export function useAreas() {
  return useQuery({ queryKey: QK_AREAS, queryFn: () => getAreas(), staleTime: Infinity });
}
