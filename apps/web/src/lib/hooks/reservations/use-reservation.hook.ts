"use client";

// متابعة حجز واحد — في الطابور الحي بنعمل polling كل 15 ثانية (لسه مفيش websockets)، وبيقف لما الحجز يخلص
import { useQuery } from "@tanstack/react-query";
import { getReservation } from "@/lib/actions/reservations/reservations.action";
import { QK_RESERVATION } from "@/lib/data/constants/query-keys.constants";
import { isActiveReservation } from "@/lib/utils/reservations/reservation-mapper";

export const LIVE_POLL_MS = 15_000;
export const BOOKED_POLL_MS = 60_000;

export function useReservation(id: string) {
  return useQuery({
    queryKey: QK_RESERVATION(id),
    queryFn: () => getReservation(id),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status || !isActiveReservation(status)) return false;
      return status === "booked" ? BOOKED_POLL_MS : LIVE_POLL_MS;
    },
    retry: (count, error) => error.status !== 404 && count < 2,
  });
}
