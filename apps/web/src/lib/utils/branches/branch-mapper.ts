// تحويل رد /branches/nearby من snake_case لأنواع الواجهة
import type { NearbyBranch, NearbyBranchesPage } from "@/lib/types/branch";
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
