// حجوزاتي: الحالية والسابقة — زي BookingsSnapshot.active/past في Flutter
import type { QueueBooking } from "@/lib/types/booking";
import { isActive } from "./booking-pricing.ts";

/** بتتاريخ بإيه: الميعاد، أو وقت الحجز */
const reference = (b: QueueBooking) => Date.parse(b.startAt ?? b.createdAt);

export function splitBookings(list: QueueBooking[]): { active: QueueBooking[]; past: QueueBooking[] } {
  const active = list.filter(isActive);
  const past = list.filter((b) => !isActive(b));
  // الطابور قبل المواعيد، والمواعيد بالأقرب
  active.sort((a, b) => Number(a.startAt !== null) - Number(b.startAt !== null) || reference(a) - reference(b));
  past.sort((a, b) => reference(b) - reference(a));
  return { active, past };
}
