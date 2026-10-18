"use client";

// تأكيد الحجز — بيكتب الحجز في الكاش ويحدّث القوائم والطوابير
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createReservation } from "@/lib/actions/reservations/reservations.action";
import {
  QK_BRANCH_BARBERS,
  QK_RESERVATION,
  QK_RESERVATION_LISTS,
} from "@/lib/data/constants/query-keys.constants";
import type { CreateReservationDto } from "@/lib/types/reservation";

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateReservationDto) => createReservation(dto),
    onSuccess: (reservation) => {
      queryClient.setQueryData(QK_RESERVATION(reservation.id), reservation);
      void queryClient.invalidateQueries({ queryKey: QK_RESERVATION_LISTS });
      void queryClient.invalidateQueries({ queryKey: QK_BRANCH_BARBERS(reservation.branch.id) });
    },
  });
}
