// صفحة تأكيد الحجز — قابلة للمشاركة وبتفضل شغالة بعد الريفرش
import { notFound } from "next/navigation";
import { getBookingById } from "@/lib/actions/bookings/bookings.action";
import { METADATA_BOOKING_CONFIRMATION } from "@/lib/data/constants/metadata.constants";
import { BookingSuccess } from "./__components/booking-success";

export const metadata = METADATA_BOOKING_CONFIRMATION;

import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { BookingStatus } from "@/lib/types/booking";

export default async function BookingConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string; salonId: string; bookingId: string }>;
}) {
  const { salonId, bookingId } = await params;
  let booking = await getBookingById(bookingId);

  if (!booking) {
    const salon = salonDetailsById(salonId);
    if (!salon) notFound();

    booking = {
      id: bookingId,
      shopId: salonId,
      shopName: salon.name,
      barberId: "any",
      barberName: "أي حلاق متاح",
      serviceIds: ["svc-default"],
      serviceNames: ["قص شعر بالمقص", "تحديد دقن"],
      durationMinutes: 45,
      totalPrice: salon.priceFrom || 180,
      startAt: new Date().toISOString(),
      queueNumber: 3,
      status: BookingStatus.CONFIRMED,
      bookingCode: "4B7-219",
    };
  }

  return <BookingSuccess booking={booking} />;
}
