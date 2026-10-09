// صالونات المنطقة بحالة الطابور الحية — بنسأل كل 15 ثانية (زي drift في Flutter)
import { useQuery } from "@tanstack/react-query";
import { getCatalog } from "@/lib/actions/salons/salons.action";
import { QK_CATALOG } from "@/lib/data/constants/query-keys.constants";

const CATALOG_REFRESH_MS = 15_000;

export function useCatalog(areaId: string) {
  return useQuery({ queryKey: QK_CATALOG(areaId), queryFn: () => getCatalog(areaId), refetchInterval: CATALOG_REFRESH_MS });
}
