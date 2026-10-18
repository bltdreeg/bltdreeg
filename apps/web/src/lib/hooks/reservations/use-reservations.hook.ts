"use client";

// حجوزاتي (القادمة أو اللي خلصت) — القادمة بتتحدث كل دقيقة عشان الـ slot اللي ميعاده جه يتحول لطابور
import { useQuery } from "@tanstack/react-query";
import { getReservations } from "@/lib/actions/reservations/reservations.action";
import { QK_RESERVATIONS } from "@/lib/data/constants/query-keys.constants";
import type { ReservationScope } from "@/lib/types/reservation";

export function useReservations(scope: ReservationScope) {
  return useQuery({
    queryKey: QK_RESERVATIONS(scope),
    queryFn: () => getReservations(scope),
    refetchInterval: scope === "active" ? 60_000 : false,
  });
}
