// تحويل ردود /branches من snake_case لأنواع الواجهة
import type {
  BranchDetail,
  BranchFeedPage,
  BranchFilters,
  BranchListItem,
  BranchServiceCategory,
  NearbyBranch,
  NearbyBranchesPage,
} from "@/lib/types/branch";
import type { ResolvedLocation } from "@/lib/types/geo";

type RawRef = { id: string | number; name: string };

export interface RawNearbyBranch {
  id: number;
  name: string;
  address: string | null;
  salon: RawRef;
  city: RawRef;
  lat: number;
  lng: number;
  distance_km: number;
  cover_image_url: string | null;
  maps_url: string | null;
}

export interface RawNearbyBranchesPage {
  data: RawNearbyBranch[];
  meta: { current_page: number; last_page: number; per_page: number; total: number; origin: ResolvedLocation };
}

const ref = (raw: RawRef) => ({ id: String(raw.id), name: raw.name });

export function mapNearbyBranch(raw: RawNearbyBranch): NearbyBranch {
  return {
    id: String(raw.id),
    name: raw.name,
    address: raw.address,
    salon: ref(raw.salon),
    city: ref(raw.city),
    lat: raw.lat,
    lng: raw.lng,
    distanceKm: raw.distance_km,
    coverImageUrl: raw.cover_image_url,
    mapsUrl: raw.maps_url,
  };
}

export function mapNearbyBranchesPage(raw: RawNearbyBranchesPage): NearbyBranchesPage {
  return {
    items: raw.data.map(mapNearbyBranch),
    page: raw.meta.current_page,
    lastPage: raw.meta.last_page,
    perPage: raw.meta.per_page,
    total: raw.meta.total,
    origin: raw.meta.origin,
  };
}

export interface RawBranchListItem extends RawNearbyBranch {
  price_from: number | null;
  currency: string;
  services: string[];
  is_new: boolean;
}

export interface RawBranchFeedPage {
  data: RawBranchListItem[];
  meta: RawNearbyBranchesPage["meta"];
}

export interface RawBranchDetail {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  maps_url: string | null;
  lat: number;
  lng: number;
  distance_km: number | null;
  salon: RawRef & { website: string | null };
  city: RawRef;
  governorate: RawRef;
  cover_image_url: string | null;
  images: string[];
  currency: string;
  price_from: number | null;
  service_categories: Array<{
    id: number | null;
    name: string | null;
    services: Array<{ id: number; name: string; description: string | null; duration_minutes: number; price: number }>;
  }>;
}

export function mapBranchListItem(raw: RawBranchListItem): BranchListItem {
  return {
    ...mapNearbyBranch(raw),
    priceFrom: raw.price_from,
    currency: raw.currency,
    services: raw.services,
    isNew: raw.is_new,
  };
}

export function mapBranchFeedPage(raw: RawBranchFeedPage): BranchFeedPage {
  return {
    items: raw.data.map(mapBranchListItem),
    page: raw.meta.current_page,
    lastPage: raw.meta.last_page,
    perPage: raw.meta.per_page,
    total: raw.meta.total,
    origin: raw.meta.origin,
  };
}

export function mapBranchDetail(raw: RawBranchDetail): BranchDetail {
  return {
    id: String(raw.id),
    name: raw.name,
    address: raw.address,
    phone: raw.phone,
    mapsUrl: raw.maps_url,
    lat: raw.lat,
    lng: raw.lng,
    distanceKm: raw.distance_km,
    salon: { ...ref(raw.salon), website: raw.salon.website },
    city: ref(raw.city),
    governorate: ref(raw.governorate),
    coverImageUrl: raw.cover_image_url,
    images: raw.images,
    currency: raw.currency,
    priceFrom: raw.price_from,
    serviceCategories: raw.service_categories.map(
      (category): BranchServiceCategory => ({
        id: category.id === null ? null : String(category.id),
        name: category.name,
        services: category.services.map((service) => ({
          id: String(service.id),
          name: service.name,
          description: service.description,
          durationMinutes: service.duration_minutes,
          price: service.price,
        })),
      }),
    ),
  };
}

/** فلاتر الواجهة ← query params بتاعة Laravel؛ القيم الفاضية والترتيب الافتراضي مبيتبعتوش */
export function toBranchFeedParams(filters: BranchFilters): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  const q = filters.q?.trim();
  if (q) params.q = q;
  if (filters.governorateId) params.governorate_id = filters.governorateId;
  if (filters.cityId) params.city_id = filters.cityId;
  if (filters.maxPrice !== undefined && Number.isFinite(filters.maxPrice)) params.max_price = filters.maxPrice;
  if (filters.sort && filters.sort !== "nearest") params.sort = filters.sort;
  return params;
}
