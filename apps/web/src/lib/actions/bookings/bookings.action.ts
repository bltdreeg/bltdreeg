// أفعال الحجوزات على السيرفر (بيانات تجريبية حالياً)
"use server";

import { redirect } from "@/i18n/navigation";
import { bookings } from "@/lib/data/bookings.constants";
import { salonDetailsById } from "@/lib/data/salon-details.constants";
import { servicesByShop } from "@/lib/data/services.constants";
import { barbersByShop } from "@/lib/data/barbers.constants";
import { ROUTE_BOOKING_CONFIRMATION } from "@/lib/data/constants/routes.constants";
import { BookingStatus, type Booking } from "@/lib/types/booking";
import type { QueueStatus } from "@/lib/types/queue";
import { buildQueueStatus } from "@/lib/utils/queue.utils";

export async function getBookings(): Promise<Booking[]> {
  return bookings;
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const found = bookings.find((b) => b.id === id);
  if (found) return found;

  // Fallback if an ephemeral or timestamp booking ID was visited directly
  if (id.startsWith("bk-")) {
    const fallback: Booking = {
      id,
      shopId: "shop-3",
      shopName: "حلاق الزمالك",
      barberId: "barber-shop-3-1",
      barberName: "كريم مصطفى",
      serviceIds: ["svc-haircut", "svc-beard"],
      serviceNames: ["قص شعر بالمقص", "تحديد دقن"],
      durationMinutes: 50,
      totalPrice: 180,
      startAt: new Date().toISOString(),
      queueNumber: 3,
      status: BookingStatus.CONFIRMED,
      bookingCode: "4B7-219",
    };
    bookings.push(fallback);
    return fallback;
  }

  return null;
}

// ponytail: بيانات تجريبية بترجع لـ array في الميموري — تتحوّل لكتابة حقيقية في الـ DB لما يبقى فيه باك إند
export async function createBooking(formData: FormData, locale: string): Promise<void> {
  const shopId = String(formData.get("shopId"));
  const barberId = String(formData.get("barberId"));
  const serviceIds = formData.getAll("serviceId").map(String);
  const startAt = String(formData.get("startAt"));

  const salon = salonDetailsById(shopId);
  const services = servicesByShop(shopId).filter((s) => serviceIds.includes(s.id));
  const barber = barbersByShop(shopId).find((b) => b.id === barberId) ?? null;
  if (!salon || services.length === 0) throw new Error("بيانات الحجز ناقصة");

  const booking: Booking = {
    id: `bk-${Date.now()}`,
    shopId,
    shopName: salon.name,
    barberId: barber?.id ?? "any",
    barberName: barber?.name ?? "أي حلاق متاح",
    serviceIds: services.map((s) => s.id),
    serviceNames: services.map((s) => s.name),
    durationMinutes: services.reduce((n, s) => n + s.durationMinutes, 0),
    totalPrice: services.reduce((n, s) => n + s.price, 0),
    startAt,
    queueNumber: salon.queue.peopleAhead + 1,
    status: BookingStatus.CONFIRMED,
  };
  bookings.push(booking);

  redirect({ href: ROUTE_BOOKING_CONFIRMATION(shopId, booking.id), locale });
}

// ponytail: mock live state — completedCount/delay come from the salon's live feed once it exists
export async function getQueueStatus(bookingId: string): Promise<QueueStatus | null> {
  const booking = await getBookingById(bookingId);
  if (!booking) return null;
  return buildQueueStatus(booking, { completedCount: 1, delayMinutes: 12 });
}

export async function cancelBooking(bookingId: string): Promise<{ success: boolean; message?: string }> {
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) {
    return { success: false, message: "الحجز غير موجود" };
  }
  booking.status = BookingStatus.CANCELLED;
  return { success: true };
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

