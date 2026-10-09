// صفحة الصالون (فريم 21–23، 39) — منقولة من salon_details.dart في Flutter. العروض بنوع الويب SalonOffer.
// Barber / Review / Service بتوع الويب مش مناسبين: مفيش تاريخ رجوع من الإجازة، ولا صور/رد الصالون/id الحلاق في التقييم.
import type { SalonOffer } from "@/lib/types/offer/offer.interface";
import type { QueueLoad } from "@/lib/types/queue";
import type { SalonSummary, ServiceKind } from "./salon-summary.interface";

export interface SalonService {
  id: string;
  name: string;
  kind: ServiceKind;
  durationMinutes: number;
  price: number;
}

export interface ServiceGroup {
  title: string;
  services: SalonService[];
}

export interface SalonBarber {
  id: string;
  name: string;
  specialty: string;
  yearsExperience: number | null;
  rating: number | null;
  reviewsCount: number;
  /** دوره الفرعي — null يعني إجازة النهارده */
  queue: QueueLoad | null;
  /** ISO — يوم رجوعه لو إجازة */
  returnsOn: string | null;
}

export interface SalonReview {
  id: string;
  authorName: string;
  stars: number;
  /** ISO */
  createdAt: string;
  text: string;
  serviceName: string | null;
  barberName: string | null;
  barberId: string | null;
  photoCount: number;
  salonReply: string | null;
}

export interface RatingScores {
  quality: number;
  cleanliness: number;
  timeAccuracy: number;
}

export interface DayHours {
  /** 0 = الأحد */
  weekday: number;
  /** دقايق من نص الليل — null = إجازة. ممكن تعدّي 24×60 (بيقفل بعد نص الليل) */
  opensAt: number | null;
  closesAt: number | null;
}

export type GalleryKind = "work" | "place" | "video";

export interface GalleryItem {
  id: string;
  kind: GalleryKind;
  url: string | null;
  caption: string | null;
  durationSeconds: number | null;
}

export interface SalonPage {
  summary: SalonSummary;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  chairsActive: number;
  serviceGroups: ServiceGroup[];
  barbers: SalonBarber[];
  offers: SalonOffer[];
  ratingBreakdown: RatingScores | null;
  reviews: SalonReview[];
  hours: DayHours[];
  gallery: GalleryItem[];
  reviewPhotos: GalleryItem[];
}
