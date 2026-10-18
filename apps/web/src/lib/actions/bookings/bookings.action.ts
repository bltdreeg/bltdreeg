// بيانات تجريبية لصفحات التقييم بس (Phase 4) — الحجز الحقيقي في actions/reservations
"use server";

import { bookings } from "@/lib/data/bookings.constants";
import type { Booking } from "@/lib/types/booking";

export async function getBookings(): Promise<Booking[]> {
  return bookings;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  return bookings.find((b) => b.id === id) ?? null;
}

export async function submitBookingRating(
  bookingId: string,
  rating: number,
  _reviewData?: {
    haircutRating?: number;
    cleanlinessRating?: number;
    punctualityRating?: number;
    tags?: string[];
    comment?: string;
    isAnonymous?: boolean;
  }
): Promise<{ success: boolean }> {
  const booking = await getBookingById(bookingId);
  if (booking) {
    booking.rating = rating;
  }
  return { success: true };
}

