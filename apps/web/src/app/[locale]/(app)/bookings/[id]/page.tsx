// تفاصيل الحجز ومتابعة الدور — FRAME 11. البيانات من /reservations/{id} في المتصفح
import { METADATA_BOOKING_DETAILS } from "@/lib/data/constants/metadata.constants";
import { ReservationDetail } from "./__components/reservation-detail";

export const metadata = METADATA_BOOKING_DETAILS;

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReservationDetail id={id} />;
}
