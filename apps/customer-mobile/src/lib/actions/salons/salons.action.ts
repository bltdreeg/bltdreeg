// أفعال الاكتشاف: المناطق وصالونات المنطقة. بتتنادى من React Query hooks بس.
import { apiClient } from "@/lib/api";
import type { Area } from "@/lib/types/area/area.interface";
import type { SalonPage, SalonSummary } from "@/lib/types/salon";
import { mapArea, mapSalonPage, mapSalonSummary, type RawArea, type RawSalonPage, type RawSalonSummary } from "@/lib/utils/salons/salon-mappers";

export async function getAreas(): Promise<Area[]> {
  return (await apiClient.get<RawArea[]>("/areas")).map(mapArea);
}

export async function getCatalog(areaId: string): Promise<SalonSummary[]> {
  return (await apiClient.get<RawSalonSummary[]>(`/areas/${encodeURIComponent(areaId)}/salons`)).map(mapSalonSummary);
}

export async function getSalonsByIds(ids: string[]): Promise<SalonSummary[]> {
  return (await apiClient.get<RawSalonSummary[]>("/salons", { params: { ids: ids.join(",") } })).map(mapSalonSummary);
}

export async function getSalonPage(salonId: string): Promise<SalonPage> {
  return mapSalonPage(await apiClient.get<RawSalonPage>(`/salons/${encodeURIComponent(salonId)}`));
}
