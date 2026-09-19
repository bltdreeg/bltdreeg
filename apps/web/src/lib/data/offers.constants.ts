// بيانات تجريبية: عروض الصالونات — من فريم ٢٢ (عروض شغّالة دلوقتي)
import { OfferKind, type SalonOffer } from "@/lib/types/offer";

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const offers: SalonOffer[] = [
  // shop-1 — صالون الكابتن حسام
  {
    id: "offer-1-1",
    shopId: "shop-1",
    kind: OfferKind.DISCOUNT,
    title: "خصم 20% على قصة الشعر",
    description: "من الأحد للأربعاء، من 12 ظهراً لـ 4 عصراً",
    expiresAt: daysFromNow(6),
    highlighted: true,
  },
  {
    id: "offer-1-2",
    shopId: "shop-1",
    kind: OfferKind.BUNDLE,
    title: "باقة: قصة + دقن بـ 100 ج.م",
    originalPrice: 120,
    price: 100,
    serviceIds: ["svc-1-1", "svc-1-4"],
  },
  {
    id: "offer-1-3",
    shopId: "shop-1",
    kind: OfferKind.LOYALTY,
    title: "الخامسة ببلاش",
    visitsDone: 3,
    visitsTarget: 5,
  },

  // shop-2 — بربر لاونج المعادي
  {
    id: "offer-2-1",
    shopId: "shop-2",
    kind: OfferKind.LOYALTY,
    title: "الخامسة ببلاش",
    visitsDone: 1,
    visitsTarget: 5,
  },
];

export function offersByShop(shopId: string): SalonOffer[] {
  return offers.filter((o) => o.shopId === shopId);
}
