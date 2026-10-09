// قوائم المحافظات/المدن + تحويل نقطة لمدينة — /geo في Laravel (الرد بيجي في { data })
import { apiClient } from "@/lib/api";
import type { GeoDivision, ResolvedLocation } from "@/lib/types/geo";
import { mapResolvedLocation, type RawGeoDivision, type RawResolvedLocation } from "@/lib/utils/auth/laravel-mappers";

export async function getGovernorates(): Promise<GeoDivision[]> {
  return (await apiClient.get<{ data: RawGeoDivision[] }>("/geo/governorates")).data;
}

export async function getCities(governorateId: string): Promise<GeoDivision[]> {
  return (await apiClient.get<{ data: RawGeoDivision[] }>(`/geo/governorates/${governorateId}/cities`)).data;
}

export async function resolvePoint(lat: number, lng: number): Promise<ResolvedLocation> {
  const response = await apiClient.get<{ data: RawResolvedLocation }>("/geo/resolve", { params: { lat, lng } });
  return mapResolvedLocation(response.data);
}
