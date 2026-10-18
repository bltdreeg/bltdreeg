// حجوزاتي — FRAME 10. البيانات من /reservations في المتصفح (BookingsView)
import { Suspense } from "react";
import { METADATA_BOOKINGS } from "@/lib/data/constants/metadata.constants";
import { BookingsSkeleton } from "./__components/bookings-skeleton";
import { BookingsView } from "./__components/bookings-view";

export const metadata = METADATA_BOOKINGS;

export default function BookingsPage() {
  return (
    <Suspense fallback={<BookingsSkeleton />}>
      <BookingsView />
    </Suspense>
  );
}
