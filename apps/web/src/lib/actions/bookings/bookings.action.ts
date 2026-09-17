// أفعال الحجوزات على السيرفر (بيانات تجريبية حالياً)
"use server";

import { bookings } from "@/lib/data/bookings.constants";
import type { Booking } from "@/lib/types/booking";
import type { QueueStatus } from "@/lib/types/queue";
import { buildQueueStatus } from "@/lib/utils/queue.utils";

export async function getBookings(): Promise<Booking[]> {
  return bookings;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  return bookings.find((b) => b.id === id) ?? null;
}

// ponytail: mock live state — completedCount/delay come from the salon's live feed once it exists
export async function getQueueStatus(bookingId: string): Promise<QueueStatus | null> {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;
  return buildQueueStatus(booking, { completedCount: 1, delayMinutes: 12 });
}
