// نوع الخدمة
export const ServiceCategory = {
  CUT: "قص وتصفيف",
  BEARD: "الدقن",
  EXTRA: "خدمات إضافية",
} as const;

export type ServiceCategory = (typeof ServiceCategory)[keyof typeof ServiceCategory];

/** ترتيب الأقسام في صفحة الصالون — قص الأول، الإضافات آخر حاجة */
export const SERVICE_CATEGORY_ORDER: ServiceCategory[] = [
  ServiceCategory.CUT,
  ServiceCategory.BEARD,
  ServiceCategory.EXTRA,
];

export interface Service {
  id: string;
  shopId: string;
  name: string;
  durationMinutes: number;
  price: number;
  category: ServiceCategory;
  /** تفصيلة صغيرة جنب المدة: "مع غسيل وتجفيف" · "لحد 12 سنة" */
  note?: string;
}
