// إنشاء حجز والتحويل لصفحة التأكيد عند النجاح
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { API_BOOKINGS } from "@/lib/data/constants/api-routes.constants";
import { ROUTE_BOOKING_CONFIRMATION } from "@/lib/data/constants/routes.constants";
import type { Booking, CreateBookingDto } from "@/lib/types/booking";
import { fetcher } from "@/lib/utils/api/fetcher";

export function useCreateBooking() {
  const router = useRouter();
  return useMutation({
    mutationFn: (dto: CreateBookingDto) =>
      fetcher<Booking>(API_BOOKINGS, { method: "POST", body: JSON.stringify(dto) }),
    onSuccess: (booking) => router.push(ROUTE_BOOKING_CONFIRMATION(booking.shopId, booking.id)),
  });
}
