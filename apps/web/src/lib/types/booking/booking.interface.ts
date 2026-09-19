// نوع الحجز
import type { BookingStatus } from "./booking-status.enum";

export interface Booking {
  id: string;
  shopId: string;
  shopName: string;
  barberId: string;
  barberName: string;
  serviceIds: string[];
  serviceNames: string[];
  durationMinutes: number;
  totalPrice: number;
  /** ISO datetime of the appointment slot (الميعاد) */
  startAt: string;
  /** رقمك في الدور */
  queueNumber: number;
  status: BookingStatus;
  /** كود الحجز المختصر مثل 4B7-219 */
  bookingCode?: string;
  /** تقييم الحجز السابق (من 1 إلى 5) */
  rating?: number;
}

