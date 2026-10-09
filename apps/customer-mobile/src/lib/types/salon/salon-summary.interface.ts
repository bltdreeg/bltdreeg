// الصالون زي ما بيظهر في القوايم (الرئيسية، البحث، المفضلة) — منقول من SalonSummary في Flutter
import type { QueueLoad } from "@/lib/types/queue";

/** فلتر "الخدمة" في البحث (فريم 14) — غير أقسام منيو الصالون في ServiceCategory */
export type ServiceKind = "haircut" | "beard" | "kids" | "color" | "skincare";

export interface SalonSummary {
  id: string;
  /** زي ما صاحب المحل كاتبه — مابيتترجمش */
  name: string;
  areaId: string;
  areaName: string;
  distanceKm: number;
  rating: number | null;
  reviewsCount: number;
  /** أرخص خدمة، بالجنيه */
  priceFrom: number;
  servicePrices: Partial<Record<ServiceKind, number>>;
  services: ServiceKind[];
  imageUrl: string | null;
  /** ISO */
  openedOn: string;
  queue: QueueLoad;
  /** ISO — موجود لما الصالون مقفول دلوقتي */
  opensAt: string | null;
  /** أيام الأسبوع المقفول فيها اليوم كله (0 = الأحد) */
  closedWeekdays: number[];
}
