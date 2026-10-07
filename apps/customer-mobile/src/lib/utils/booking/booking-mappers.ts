// شكل حجز الطابور الخام (snake_case) زي BookingModel في Flutter + تحويله. الـ mock والـ action الاتنين بيستخدموه.
import type { DaySchedule, QueueBooking, QueueBookingStatus } from "@/lib/types/booking";

export interface RawBooking {
  id: string;
  salon_id: string;
  salon_name: string;
  salon_area: string;
  lat: number;
  lng: number;
  services: { id: string; name: string; duration: number; price: number }[];
  status: QueueBookingStatus;
  subtotal: number;
  discounts: { offer_id: string; amount: number }[];
  created_at: string;
  start_at: string | null;
  barber_id: string | null;
  barber_name: string | null;
  ticket_number: number;
  people_ahead: number;
  wait_minutes: number;
  turn_started_at: string | null;
  postpone_used: boolean;
  rating: number | null;
  /** الانتظار اللي التطبيق قاله وقت الدخول (الطابور بس) */
  quoted_wait_minutes: number | null;
  /** ISO — وقت ما قعد على الكرسي */
  served_at: string | null;
}

export const mapBooking = (r: RawBooking): QueueBooking => {
  const discounts = r.discounts.map((d) => ({ offerId: d.offer_id, amount: d.amount }));
  return {
    id: r.id,
    salonId: r.salon_id,
    salonName: r.salon_name,
    salonArea: r.salon_area,
    latitude: r.lat,
    longitude: r.lng,
    services: r.services.map((s) => ({ id: s.id, name: s.name, durationMinutes: s.duration, price: s.price })),
    status: r.status,
    subtotal: r.subtotal,
    discounts,
    total: r.subtotal - discounts.reduce((sum, d) => sum + d.amount, 0),
    createdAt: r.created_at,
    startAt: r.start_at,
    barberId: r.barber_id,
    barberName: r.barber_name,
    ticketNumber: r.ticket_number,
    peopleAhead: r.people_ahead,
    waitMinutes: r.wait_minutes,
    turnStartedAt: r.turn_started_at,
    postponeUsed: r.postpone_used,
    rating: r.rating,
    quotedWaitMinutes: r.quoted_wait_minutes,
    actualWaitMinutes: r.served_at ? Math.round((Date.parse(r.served_at) - Date.parse(r.created_at)) / 60_000) : null,
  };
};

export interface RawDaySchedule {
  day: string;
  slots: { start: string; free_barber_ids: string[] }[];
}

export const mapDaySchedule = (r: RawDaySchedule): DaySchedule => ({ day: r.day, slots: r.slots.map((s) => ({ start: s.start, freeBarberIds: s.free_barber_ids })) });
