// يتابع حالة الدور الحية يوم الميعاد
import { useQuery } from "@tanstack/react-query";
import { API_BOOKING_QUEUE_STATUS } from "@/lib/data/constants/api-routes.constants";
import { QK_QUEUE_STATUS } from "@/lib/data/constants/query-keys.constants";
import type { QueueStatus } from "@/lib/types/queue";
import { fetcher } from "@/lib/utils/api/fetcher";

export const QUEUE_POLL_INTERVAL_MS = 30_000;

export function useQueueStatus(bookingId: string, enabled = true) {
  return useQuery<QueueStatus>({
    queryKey: QK_QUEUE_STATUS(bookingId),
    queryFn: () => fetcher<QueueStatus>(API_BOOKING_QUEUE_STATUS(bookingId)),
    refetchInterval: (query) => (query.state.data?.isYourTurn ? false : QUEUE_POLL_INTERVAL_MS),
    enabled,
  });
}
