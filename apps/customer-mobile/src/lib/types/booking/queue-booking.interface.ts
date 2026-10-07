// حجز الطابور أو ميعاد (فريم 24–30 + خطوة "امتى تحب تيجي؟" من Flutter، GAPS D7) — منقول من booking.dart في Flutter.
// Booking بتاع الويب ميعاد متحجز (startAt، bookingCode) فمش مناسب هنا.
import type { DraftService } from "@/lib/utils/booking-draft";

/** الطابور: waiting → yourTurn → inService → completed؛ الميعاد بيبدأ upcoming. cancelled (خرج/لغى) و missed (ما حضرش) نهائيين */
export type QueueBookingStatus = "waiting" | "yourTurn" | "upcoming" | "inService" | "completed" | "cancelled" | "missed";

/** اللي شاشة الطابور بتعرضه: waiting بيبقى approaching لما يفضل واحد أو أقل */
export type QueueStage = "waiting" | "approaching" | "yourTurn" | "upcoming" | "inService" | "completed" | "cancelled" | "missed";

export interface AppliedDiscount {
  offerId: string;
  amount: number;
}

export interface QueueBooking {
  id: string;
  salonId: string;
  salonName: string;
  salonArea: string;
  latitude: number;
  longitude: number;
  services: DraftService[];
  status: QueueBookingStatus;
  subtotal: number;
  discounts: AppliedDiscount[];
  total: number;
  /** ISO */
  createdAt: string;
  /** ISO — بداية الميعاد؛ null = طابور دلوقتي */
  startAt: string | null;
  /** null = أي حلاق متاح */
  barberId: string | null;
  barberName: string | null;
  /** رقم الدور — 0 للميعاد */
  ticketNumber: number;
  peopleAhead: number;
  waitMinutes: number;
  /** ISO — بداية "حان دورك"، العدّاد (٥ دقايق) بيبدأ منها */
  turnStartedAt: string | null;
  /** "أجّلني واحد" مرة واحدة بس */
  postponeUsed: boolean;
  /** تقييمي الكلي (نجوم) لو قيّمت الزيارة — فريم 10 */
  rating: number | null;
  /** "التطبيق قال N د واستنيت N د" (فريم 31) — null للميعاد أو اللي ما اتخدمش */
  quotedWaitMinutes: number | null;
  actualWaitMinutes: number | null;
}

/** ميعاد في جدول يوم (خطوة ١) — الحلاقين الفاضيين فيه بيتشالوا للخطوة الجاية */
export interface TimeSlot {
  /** ISO */
  start: string;
  freeBarberIds: string[];
}

export interface DaySchedule {
  /** YYYY-MM-DD */
  day: string;
  slots: TimeSlot[];
}
