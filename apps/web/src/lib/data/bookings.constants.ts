// بيانات تجريبية: حجز النهارده للمتابعة الحية، وحجز قادم، و3 حجوزات سابقة
import { BookingStatus, type Booking } from "@/lib/types/booking";

const todayAt = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};
const daysFromNow = (days: number, h: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(h, 0, 0, 0);
  return d.toISOString();
};

export const bookings: Booking[] = [
  {
    id: "bk-today",
    shopId: "shop-2",
    shopName: "بربر لاونج المعادي",
    barberId: "barber-3",
    barberName: "كريم مصطفى",
    serviceIds: ["svc-2-1", "svc-2-4"],
    serviceNames: ["قص شعر بالمقص", "تحديد دقن"],
    durationMinutes: 50,
    totalPrice: 180,
    startAt: todayAt(18, 30),
    queueNumber: 3,
    status: BookingStatus.CONFIRMED,
    bookingCode: "4B7-219",
  },
  {
    id: "bk-upcoming",
    shopId: "shop-1",
    shopName: "صالون الكابتن حسام",
    barberId: "barber-1",
    barberName: "أحمد مجدي",
    serviceIds: ["svc-1-1"],
    serviceNames: ["قص شعر"],
    durationMinutes: 30,
    totalPrice: 80,
    startAt: daysFromNow(2, 11),
    queueNumber: 7,
    status: BookingStatus.CONFIRMED,
    bookingCode: "8C2-406",
  },
  {
    id: "bk-past-1",
    shopId: "shop-2",
    shopName: "بربر لاونج المعادي",
    barberId: "barber-3",
    barberName: "كريم مصطفى",
    serviceIds: ["svc-2-1", "svc-2-4"],
    serviceNames: ["قص شعر بالمقص", "تحديد دقن"],
    durationMinutes: 50,
    totalPrice: 120,
    startAt: daysFromNow(-4, 16),
    queueNumber: 2,
    status: BookingStatus.DONE,
    bookingCode: "3X1-982",
  },
  {
    id: "bk-past-2",
    shopId: "shop-16",
    shopName: "جنتلمان ستايل باربر",
    barberId: "barber-16-1",
    barberName: "محمود عبد العال",
    serviceIds: ["svc-16-2"],
    serviceNames: ["تحديد دقن"],
    durationMinutes: 25,
    totalPrice: 60,
    startAt: daysFromNow(-9, 14),
    queueNumber: 4,
    status: BookingStatus.DONE,
    bookingCode: "9K2-441",
    rating: 4,
  },
  {
    id: "bk-past-3",
    shopId: "shop-4",
    shopName: "صالون البرنس المودرن",
    barberId: "barber-4-1",
    barberName: "سعيد",
    serviceIds: ["svc-4-1"],
    serviceNames: ["قص شعر"],
    durationMinutes: 30,
    totalPrice: 80,
    startAt: daysFromNow(-14, 18),
    queueNumber: 5,
    status: BookingStatus.CANCELLED,
    bookingCode: "7M0-119",
  },
];

