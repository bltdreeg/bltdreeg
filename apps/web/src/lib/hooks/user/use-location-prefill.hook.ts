"use client";

// تعبئة مبدئية: GPS لو المستخدم سمح، وإلا تقدير الـ IP (أو القاهرة) من السيرفر
import { useQuery } from "@tanstack/react-query";
import { resolvePoint } from "@/lib/actions/geo/geo.action";
import { getLocationEstimate } from "@/lib/actions/user/user.action";
import { QK_LOCATION_PREFILL } from "@/lib/data/constants/query-keys.constants";
import { requestBrowserPosition } from "@/lib/utils/location/browser-position";
import { isInEgypt } from "@/lib/utils/location/location-choice";

export type GpsStatus = "granted" | "denied" | "unavailable" | "outside";

export function useLocationPrefill() {
  return useQuery({
    queryKey: QK_LOCATION_PREFILL,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      const position = await requestBrowserPosition();

      if ("lat" in position && isInEgypt(position.lat, position.lng)) {
        return { location: await resolvePoint(position.lat, position.lng), gps: "granted" as GpsStatus };
      }

      const gps: GpsStatus = "error" in position ? position.error : "outside";
      return { location: await getLocationEstimate(), gps };
    },
  });
}
