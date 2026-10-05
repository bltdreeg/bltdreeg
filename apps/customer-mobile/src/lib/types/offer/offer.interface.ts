// نوع العرض
export const OfferKind = {
  DISCOUNT: "discount",
  BUNDLE: "bundle",
  LOYALTY: "loyalty",
} as const;

export type OfferKind = (typeof OfferKind)[keyof typeof OfferKind];

export interface SalonOffer {
  id: string;
  shopId: string;
  kind: OfferKind;
  title: string;
  description?: string;
  /** تاريخ انتهاء العرض — ISO */
  expiresAt?: string;
  /** سعر الباقة قبل وبعد الخصم */
  originalPrice?: number;
  price?: number;
  /** تقدّم برنامج الولاء: عندك كام من كام زيارة */
  visitsDone?: number;
  visitsTarget?: number;
  /** العرض الشغّال دلوقتي — إطار متقطع تركوازي */
  highlighted?: boolean;
  /** الخدمات اللي العرض بيغطيها، لو باقة */
  serviceIds?: string[];
}
