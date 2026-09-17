// تقييمات صالون معين
import { useQuery } from "@tanstack/react-query";
import { API_SHOP_REVIEWS } from "@/lib/data/constants/api-routes.constants";
import { QK_SHOP_REVIEWS } from "@/lib/data/constants/query-keys.constants";
import type { Review } from "@/lib/types/review";
import { fetcher } from "@/lib/utils/api/fetcher";

export function useReviews(shopId: string) {
  return useQuery<Review[]>({
    queryKey: QK_SHOP_REVIEWS(shopId),
    queryFn: () => fetcher<Review[]>(API_SHOP_REVIEWS(shopId)),
  });
}
