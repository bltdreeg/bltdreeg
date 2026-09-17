// حالة الحجز: مؤكد · مستني · تم · اتلغى
export const BookingStatus = {
  CONFIRMED: "CONFIRMED",
  WAITING: "WAITING",
  DONE: "DONE",
  CANCELLED: "CANCELLED",
} as const;

export type BookingStatus = (typeof BookingStatus)[keyof typeof BookingStatus];
