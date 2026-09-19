// بيانات تجريبية: الحلاقين — من التصميم (بربر لاونج المعادي)
import { at } from "@/lib/data/shops.constants";
import type { Barber } from "@/lib/types/barber/barber.interface";

const TOMORROW = 1;

export const barbers: Barber[] = [
  {
    id: "barber-1",
    shopId: "shop-2",
    name: "كريم مصطفى",
    title: "حلاق أول",
    specialty: "قص كلاسيك",
    experienceYears: 6,
    rating: 4.8,
    reviewCount: 92,
    nextSlotAt: at(13, 15),
    queue: { peopleAhead: 0, waitMinutes: 0 },
    returnsOnDay: null,
  },
  {
    id: "barber-2",
    shopId: "shop-2",
    name: "أحمد مجدي",
    title: "حلاق",
    specialty: "دقن وموس",
    experienceYears: 4,
    rating: 4.5,
    reviewCount: 61,
    nextSlotAt: at(20, 0),
    queue: { peopleAhead: 2, waitMinutes: 20 },
    returnsOnDay: null,
  },
  {
    id: "barber-3",
    shopId: "shop-2",
    name: "محمود عبد العال",
    title: "حلاق",
    specialty: "فيد وتدريج",
    experienceYears: 9,
    rating: 4.7,
    reviewCount: 74,
    nextSlotAt: at(13, 0, TOMORROW),
    queue: null,
    returnsOnDay: "بكرة",
  },
  // shop-1 — صالون الكابتن حسام
  {
    id: "barber-1-1",
    shopId: "shop-1",
    name: "حسام حسن",
    title: "حلاق أول",
    specialty: "فيد وتدريج",
    experienceYears: 8,
    rating: 4.9,
    reviewCount: 110,
    nextSlotAt: at(13, 15),
    queue: { peopleAhead: 2, waitMinutes: 20 },
    returnsOnDay: null,
  },
  {
    id: "barber-1-2",
    shopId: "shop-1",
    name: "سامح عزت",
    title: "حلاق",
    specialty: "حلاقة كلاسيك ودقن",
    experienceYears: 5,
    rating: 4.6,
    reviewCount: 45,
    nextSlotAt: at(18, 0),
    queue: { peopleAhead: 0, waitMinutes: 0 },
    returnsOnDay: null,
  },
  {
    id: "barber-1-3",
    shopId: "shop-1",
    name: "ياسر كمال",
    title: "حلاق",
    specialty: "صبغة وعلاج شعر",
    experienceYears: 7,
    rating: 4.7,
    reviewCount: 68,
    nextSlotAt: at(14, 0, TOMORROW),
    queue: null,
    returnsOnDay: "بكرة",
  },
];

const DEFAULT_BARBER_NAMES = [
  {
    name: "كريم مصطفى",
    title: "حلاق أول",
    specialty: "قص كلاسيك",
    years: 6,
    rating: 4.8,
    reviews: 92,
    hour: 13,
    min: 15,
    dayOffset: 0,
    queue: { peopleAhead: 0, waitMinutes: 0 } as const,
    returnsOnDay: null,
  },
  {
    name: "أحمد مجدي",
    title: "حلاق",
    specialty: "دقن وموس",
    years: 4,
    rating: 4.5,
    reviews: 61,
    hour: 20,
    min: 0,
    dayOffset: 0,
    queue: { peopleAhead: 2, waitMinutes: 20 } as const,
    returnsOnDay: null,
  },
  {
    name: "محمود عبد العال",
    title: "حلاق",
    specialty: "فيد وتدريج",
    years: 9,
    rating: 4.7,
    reviews: 74,
    hour: 13,
    min: 0,
    dayOffset: 1,
    queue: null,
    returnsOnDay: "بكرة",
  },
];

export function barbersByShop(shopId: string): Barber[] {
  const own = barbers.filter((b) => b.shopId === shopId);
  if (own.length > 0) return own;

  return DEFAULT_BARBER_NAMES.map((b, i) => ({
    id: `barber-${shopId}-${i + 1}`,
    shopId,
    name: b.name,
    title: b.title,
    specialty: b.specialty,
    experienceYears: b.years,
    rating: b.rating,
    reviewCount: b.reviews,
    nextSlotAt: at(b.hour, b.min, b.dayOffset),
    queue: b.queue,
    returnsOnDay: b.returnsOnDay,
  }));
}
