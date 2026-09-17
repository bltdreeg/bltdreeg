// صفحة تأكيد الحجز — قابلة للمشاركة وبتفضل شغالة بعد الريفرش
import { notFound } from "next/navigation";
import { getBookingById } from "@/lib/actions/bookings/bookings.action";
import { METADATA_BOOKING_CONFIRMATION } from "@/lib/data/constants/metadata.constants";
import { BookingSuccess } from "./__components/booking-success";

export const metadata = METADATA_BOOKING_CONFIRMATION;

export default async function BookingConfirmationPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const booking = await getBookingById(bookingId);
  if (!booking) notFound();
  return <BookingSuccess booking={booking} />;
}
