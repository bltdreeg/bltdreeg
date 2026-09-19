// تفاصيل الصالون الكاملة — فوق بيانات الكارت الأساسية في Shop
import type { Punctuality, QueueLoad } from "@/lib/types/queue";
import type { Shop } from "@/lib/types/shop/shop.interface";

export interface WorkingHours {
  /** "الأحد" ... "السبت" */
  day: string;
  /** null يعني مقفول اليوم ده */
  open: string | null;
  close: string | null;
}

/** بند من تفصيل التقييم: "بيمشي في الميعاد" 4.8 */
export interface RatingBreakdown {
  label: string;
  value: number;
}

export interface SalonDetails extends Shop {
  photos: string[];
  address: string;
  landmark: string;
  phone: string;
  /** 7 أيام — الأحد أول عنصر */
  hours: WorkingHours[];
  ratingCounts: Record<1 | 2 | 3 | 4 | 5, number>;
  ratingBreakdown: RatingBreakdown[];
  punctuality: Punctuality;
  /** بمتوسط تأخير كام دقيقة */
  avgDelayMinutes: number;
  /** آخر كام ميعاد اتحسب عليهم متوسط الالتزام */
  recentBookingsSampled: number;
  /** حالة الطابور الحية دلوقتي في الصالون */
  queue: QueueLoad;
  /** عدد الكراسي الشغالة دلوقتي */
  chairsActive: number;
}
