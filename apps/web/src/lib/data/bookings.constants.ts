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
    shopId: "shop-1",
    shopName: "صالون الأمير",
    barberId: "barber-1",
    barberName: "أحمد",
    serviceIds: ["svc-haircut"],
    serviceNames: ["قص شعر"],
    durationMinutes: 30,
    totalPrice: 120,
    startAt: todayAt(18, 30),
    queueNumber: 3,
    status: BookingStatus.CONFIRMED,
  },
  {
    id: "bk-upcoming",
    shopId: "shop-2",
    shopName: "باربر هاوس",
    barberId: "barber-3",
    barberName: "محمود",
    serviceIds: ["svc-haircut", "svc-beard"],
    serviceNames: ["قص شعر", "تهذيب دقن"],
    durationMinutes: 45,
    totalPrice: 180,
    startAt: daysFromNow(3, 19),
    queueNumber: 5,
    status: BookingStatus.CONFIRMED,
  },
  {
    id: "bk-past-1",
    shopId: "shop-1",
    shopName: "صالون الأمير",
    barberId: "barber-1",
    barberName: "أحمد",
    serviceIds: ["svc-haircut"],
    serviceNames: ["قص شعر"],
    durationMinutes: 30,
    totalPrice: 120,
    startAt: daysFromNow(-7, 17),
    queueNumber: 2,
    status: BookingStatus.DONE,
  },
  {
    id: "bk-past-2",
    shopId: "shop-3",
    shopName: "كلاسيك كت",
    barberId: "barber-5",
    barberName: "كريم",
    serviceIds: ["svc-beard"],
    serviceNames: ["تهذيب دقن"],
    durationMinutes: 20,
    totalPrice: 70,
    startAt: daysFromNow(-21, 20),
    queueNumber: 1,
    status: BookingStatus.DONE,
  },
  {
    id: "bk-past-3",
    shopId: "shop-2",
    shopName: "باربر هاوس",
    barberId: "barber-3",
    barberName: "محمود",
    serviceIds: ["svc-haircut"],
    serviceNames: ["قص شعر"],
    durationMinutes: 30,
    totalPrice: 130,
    startAt: daysFromNow(-40, 16),
    queueNumber: 4,
    status: BookingStatus.CANCELLED,
  },
];
