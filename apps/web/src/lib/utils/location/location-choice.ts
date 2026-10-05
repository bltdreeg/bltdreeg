// منطق اختيار الموقع (من غير DOM) — بيتختبر بـ node --test
import type { ConfirmLocationDto, ResolvedLocation } from "../../types/geo/geo.interface.ts";

export const EGYPT_BOUNDS = { lat: [21.5, 32.0], lng: [24.5, 37.0] } as const;

export function isInEgypt(lat: number, lng: number): boolean {
  return lat >= EGYPT_BOUNDS.lat[0] && lat <= EGYPT_BOUNDS.lat[1] && lng >= EGYPT_BOUNDS.lng[0] && lng <= EGYPT_BOUNDS.lng[1];
}

/** السيرفر بيحتفظ بالنقطة لو في نفس المدينة، وإلا بيستخدم مركز المنطقة. */
export function toConfirmPayload(areaId: string, prefill: ResolvedLocation): ConfirmLocationDto {
  if (prefill.source === "gps" || prefill.source === "ip" || prefill.source === "manual") {
    return { areaId, lat: prefill.lat, lng: prefill.lng, source: prefill.source };
  }
  return { areaId };
}
