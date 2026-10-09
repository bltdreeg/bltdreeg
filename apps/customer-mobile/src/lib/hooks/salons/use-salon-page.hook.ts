// صفحة الصالون بالطابور الحي — بنسأل كل 15 ثانية زي الرئيسية. 404 مابيتعادش (الصالون مش موجود)
import { useQuery } from "@tanstack/react-query";
import { getSalonPage } from "@/lib/actions/salons/salons.action";
import { QK_SALON } from "@/lib/data/constants/query-keys.constants";
import { ApiError } from "@/lib/utils/api/api-error";

export function useSalonPage(salonId: string) {
  return useQuery({
    queryKey: QK_SALON(salonId),
    queryFn: () => getSalonPage(salonId),
    refetchInterval: 15_000,
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 2,
  });
}
