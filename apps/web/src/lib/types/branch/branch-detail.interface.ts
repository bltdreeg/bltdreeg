// صفحة الصالون — /branches/{id} في Laravel. الخدمات والأسعار على مستوى الصالون كله لحد دلوقتي
import type { NamedRef } from "@/lib/types/geo";

export interface BranchService {
  id: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  price: number;
}

export interface BranchServiceCategory {
  /** null = خدمات من غير تصنيف */
  id: string | null;
  name: string | null;
  services: BranchService[];
}

export interface BranchDetail {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  mapsUrl: string | null;
  lat: number;
  lng: number;
  /** null لو الزائر مبعتش موقعه */
  distanceKm: number | null;
  salon: NamedRef & { website: string | null };
  city: NamedRef;
  governorate: NamedRef;
  coverImageUrl: string | null;
  /** الغلاف الأول وبعده باقي الصور */
  images: string[];
  currency: string;
  priceFrom: number | null;
  serviceCategories: BranchServiceCategory[];
}
