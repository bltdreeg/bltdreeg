// نوع المحل
export interface Shop {
  id: string;
  name: string;
  areaId: string;
  /** اسم المنطقة زي ما بيتعرض على الكارت: "المعادي" */
  areaName: string;
  /** المسافة بالكيلومتر، بتتعرض 1.2 كم */
  distanceKm: number;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  coverImage: string;
  /** أقرب ميعاد فاضي — ISO. null يعني مفيش مواعيد خلاص */
  nextSlotAt: string | null;
  /** أسماء الخدمات للعرض في صف القائمة */
  services: string[];
  /** صالون فتح من شهرين — بيظهر في "جديد في منطقتك" */
  isNew?: boolean;
  /** تاريخ الافتتاح للصالونات الجديدة — ISO */
  openedAt?: string;
}
