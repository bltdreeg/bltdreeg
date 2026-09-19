// فلاتر البحث عن المحلات
export interface ShopFilters {
  /** نص البحث: اسم صالون أو منطقة */
  q?: string;
  areaId?: string;
  /** أقصى سعر بالجنيه */
  maxPrice?: number;
  /** أقصى مسافة بالكيلومتر */
  maxDistanceKm?: number;
  /** الصالونات اللي فيها ميعاد النهارده بس */
  todayOnly?: boolean;
  /** خدمة واحدة على الأقل من دول */
  services?: string[];
  sort?: ShopSort;
}

export const ShopSort = {
  NEXT_SLOT: "next-slot",
  NEAREST: "nearest",
  RATING: "rating",
  PRICE: "price",
  NEWEST: "newest",
} as const;

export type ShopSort = (typeof ShopSort)[keyof typeof ShopSort];
