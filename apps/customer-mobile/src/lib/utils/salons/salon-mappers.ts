// أشكال الـ API الخام (snake_case) للمناطق والصالونات + تحويلها لأنواع التطبيق. الـ mock والـ action الاتنين بيستخدموها.
import type { Area } from "@/lib/types/area/area.interface";
import type { SalonPage, SalonSummary, ServiceKind } from "@/lib/types/salon";

export interface RawArea {
  id: string;
  name: string;
  city: Area["city"];
  salons_count: number;
  is_nearby: boolean;
}

export interface RawSalonSummary {
  id: string;
  name: string;
  area_id: string;
  area_name: string;
  distance_km: number;
  rating: number | null;
  reviews_count: number;
  price_from: number;
  service_prices: Partial<Record<ServiceKind, number>>;
  image_url: string | null;
  opened_on: string;
  queue: { people_ahead: number; wait_minutes: number };
  opens_at: string | null;
  closed_weekdays: number[];
}

export const mapArea = (r: RawArea): Area => ({ id: r.id, name: r.name, city: r.city, shopCount: r.salons_count, isNearby: r.is_nearby });

export const mapSalonSummary = (r: RawSalonSummary): SalonSummary => ({
  id: r.id,
  name: r.name,
  areaId: r.area_id,
  areaName: r.area_name,
  distanceKm: r.distance_km,
  rating: r.rating,
  reviewsCount: r.reviews_count,
  priceFrom: r.price_from,
  servicePrices: r.service_prices,
  services: Object.keys(r.service_prices) as ServiceKind[],
  imageUrl: r.image_url,
  openedOn: r.opened_on,
  queue: { peopleAhead: r.queue.people_ahead, waitMinutes: r.queue.wait_minutes },
  opensAt: r.opens_at,
  closedWeekdays: r.closed_weekdays,
});

// ponytail: عقد صفحة الصالون مع Laravel لسه مش متحدد — الـ summary بس بشكل الكتالوج (snake_case)، والباقي زي التطبيق
export type RawSalonPage = Omit<SalonPage, "summary"> & { summary: RawSalonSummary };

export const mapSalonPage = ({ summary, ...rest }: RawSalonPage): SalonPage => ({ ...rest, summary: mapSalonSummary(summary) });
