// حجز الطابور (محتاج تسجيل دخول) — بيتنادى من React Query hooks بس
import { apiClient } from "@/lib/api";
import type { DaySchedule, QueueBooking } from "@/lib/types/booking";
import { mapBooking, mapDaySchedule, type RawBooking, type RawDaySchedule } from "@/lib/utils/booking/booking-mappers";
import type { RatingForm } from "@/lib/utils/rating/rating-form";

export type QueueAction = "check-in" | "postpone" | "leave";

export interface ConfirmBookingInput {
  /** بيتولد مرة واحدة لكل شاشة مراجعة — تكرار الضغط مايعملش حجزين */
  requestId: string;
  salonId: string;
  serviceIds: string[];
  /** null = أي حلاق متاح */
  barberId: string | null;
  /** ISO — null = ادخل الطابور دلوقتي */
  startAt: string | null;
}

export async function confirmBooking(input: ConfirmBookingInput): Promise<QueueBooking> {
  const body = { request_id: input.requestId, salon_id: input.salonId, service_ids: input.serviceIds, barber_id: input.barberId, start_at: input.startAt };
  return mapBooking(await apiClient.post<RawBooking>("/bookings", body));
}

export async function getBooking(bookingId: string): Promise<QueueBooking> {
  return mapBooking(await apiClient.get<RawBooking>(`/bookings/${encodeURIComponent(bookingId)}`));
}

export async function queueAction(bookingId: string, action: QueueAction): Promise<QueueBooking> {
  return mapBooking(await apiClient.post<RawBooking>(`/bookings/${encodeURIComponent(bookingId)}/${action}`));
}

/** مواعيد يوم (YYYY-MM-DD) على قد مدة الخدمات */
export async function getDaySchedule(salonId: string, day: string, minutes: number): Promise<DaySchedule> {
  return mapDaySchedule(await apiClient.get<RawDaySchedule>(`/salons/${encodeURIComponent(salonId)}/slots`, { params: { day, minutes } }));
}

/** حجوزاتي كلها (الحالية والسابقة) — فريم 09–10 */
export async function getMyBookings(): Promise<QueueBooking[]> {
  return (await apiClient.get<RawBooking[]>("/me/bookings")).map(mapBooking);
}

/** تقييم زيارة خلصت (فريم 31) */
export async function submitRating(bookingId: string, form: RatingForm): Promise<QueueBooking> {
  // ponytail: الصور بتتبعت uris في JSON — multipart (زي Flutter) لما الـ endpoint يبقى موجود على الباك إند
  const body = {
    overall: form.overall,
    quality: form.quality,
    cleanliness: form.cleanliness,
    time_accuracy: form.timeAccuracy,
    tags: form.tags,
    comment: form.comment.trim(),
    anonymous: form.anonymous,
    photos: form.photos,
  };
  return mapBooking(await apiClient.post<RawBooking>(`/bookings/${encodeURIComponent(bookingId)}/rating`, body));
}
