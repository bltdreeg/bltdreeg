import type { QueueLoad } from "@/lib/types/queue";

// نوع الحلاق
export interface Barber {
  id: string;
  shopId: string;
  name: string;
  rating: number;
  reviewCount: number;
  /** "حلاق أول" · "حلاق" */
  title: string;
  /** تخصصه: "فيد وتدريج" · "حلاقة كلاسيك ودقن" */
  specialty: string;
  experienceYears: number;
  /** أقرب ميعاد فاضي عند الحلاق ده تحديدًا — null يعني مفيش مواعيد خلاص */
  nextSlotAt: string | null;
  /** دوره الفرعي دلوقتي — null يعني إجازة النهارده */
  queue: QueueLoad | null;
  /** لو إجازة، يوم رجوعه: "بكرة" — null لو شغال النهارده */
  returnsOnDay: string | null;
}
