"use client";

// إلغاء الحجز (أو الخروج من الطابور) — من غير غرامة قبل بداية الخدمة
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelReservation } from "@/lib/actions/reservations/reservations.action";
import { QK_RESERVATION, QK_RESERVATION_LISTS } from "@/lib/data/constants/query-keys.constants";

export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cancelReservation(id),
    onSuccess: (reservation) => {
      queryClient.setQueryData(QK_RESERVATION(reservation.id), reservation);
      void queryClient.invalidateQueries({ queryKey: QK_RESERVATION_LISTS });
    },
  });
}
