// الحجز: مواعيد اليوم، متابعة حية (كل ٥ ثواني والطابور شغّال)، التأكيد، وأفعال الطابور (حضرت / أجّلني / اطلع)
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { confirmBooking, getBooking, getDaySchedule, getMyBookings, queueAction, submitRating, type ConfirmBookingInput, type QueueAction } from "@/lib/actions/booking/booking.action";
import { QK_BOOKING, QK_MY_BOOKINGS, QK_SLOTS } from "@/lib/data/constants/query-keys.constants";
import type { QueueBooking } from "@/lib/types/booking";
import { ApiError } from "@/lib/utils/api/api-error";
import { bookingDraft } from "@/lib/utils/booking-draft";
import { isRunning } from "@/lib/utils/booking/booking-pricing";
import type { RatingForm } from "@/lib/utils/rating/rating-form";

export function useBooking(bookingId: string) {
  return useQuery({
    queryKey: QK_BOOKING(bookingId),
    queryFn: () => getBooking(bookingId),
    // ponytail: polling بيقلّد الدفع اللحظي — WebSocket مع الباك إند
    refetchInterval: (q) => (q.state.data && isRunning(q.state.data) ? 5_000 : false),
    retry: (count, error) => !(error instanceof ApiError && error.status === 404) && count < 2,
  });
}

export function useConfirmBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ConfirmBookingInput) => confirmBooking(input),
    onSuccess: (booking) => {
      bookingDraft.clear(booking.salonId);
      queryClient.setQueryData(QK_BOOKING(booking.id), booking);
      void queryClient.invalidateQueries({ queryKey: QK_MY_BOOKINGS });
    },
  });
}

export function useQueueAction(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (action: QueueAction) => queueAction(bookingId, action),
    onSuccess: (booking: QueueBooking) => {
      queryClient.setQueryData(QK_BOOKING(bookingId), booking);
      void queryClient.invalidateQueries({ queryKey: QK_MY_BOOKINGS });
    },
  });
}

export function useSubmitRating(bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (form: RatingForm) => submitRating(bookingId, form),
    onSuccess: (booking) => {
      queryClient.setQueryData(QK_BOOKING(bookingId), booking);
      void queryClient.invalidateQueries({ queryKey: QK_MY_BOOKINGS });
    },
  });
}

/** المواعيد بتتغير لما حد يحجز — بتتجاب تاني بعد دقيقة */
export function useDaySchedule(salonId: string, day: string, minutes: number, enabled = true) {
  return useQuery({ queryKey: QK_SLOTS(salonId, day, minutes), queryFn: () => getDaySchedule(salonId, day, minutes), enabled, staleTime: 60_000 });
}

/** حجوزاتي — بتتحدّث كل ٥ ثواني لو فيه طابور شغّال (كارت الدور الحي) */
export function useMyBookings(enabled = true) {
  return useQuery({
    queryKey: QK_MY_BOOKINGS,
    queryFn: () => getMyBookings(),
    enabled,
    refetchInterval: (q) => (q.state.data?.some(isRunning) ? 5_000 : false),
  });
}
