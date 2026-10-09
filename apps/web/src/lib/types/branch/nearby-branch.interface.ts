// فرع صالون في قائمة "الأقرب ليك" — /branches/nearby في Laravel
import type { NamedRef, ResolvedLocation } from "@/lib/types/geo";
import type { Paginated } from "@/lib/types/paginated.interface";

export interface NearbyBranch {
  id: string;
  name: string;
  address: string | null;
  salon: NamedRef;
  city: NamedRef;
  lat: number;
  lng: number;
  distanceKm: number;
  coverImageUrl: string | null;
  mapsUrl: string | null;
}

export interface NearbyBranchesPage extends Paginated<NearbyBranch> {
  /** النقطة اللي اترتّب منها: gps لو العميل سمح، وإلا ip أو default */
  origin: ResolvedLocation;
}
