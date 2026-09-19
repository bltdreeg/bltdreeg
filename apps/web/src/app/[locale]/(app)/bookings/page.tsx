// حجوزاتي — FRAME 10
import { getBookings } from "@/lib/actions/bookings/bookings.action";
import { METADATA_BOOKINGS } from "@/lib/data/constants/metadata.constants";
import { BookingsView } from "./__components/bookings-view";

export const metadata = METADATA_BOOKINGS;

export default async function BookingsPage() {
  const allBookings = await getBookings();

  return <BookingsView initialBookings={allBookings} />;
}

