"use client";

// تعبئة مبدئية بطلبات أقل: GPS الأول، وتقدير الـ IP من السيرفر بس لو الـ GPS ماتوفرش
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { resolvePoint } from "@/lib/actions/geo/geo.action";
import { getLocationEstimate } from "@/lib/actions/user/user.action";
import { QK_LOCATION_PREFILL } from "@/lib/data/constants/query-keys.constants";
import { requestBrowserPosition } from "@/lib/utils/location/browser-position";
import { isInEgypt } from "@/lib/utils/location/location-choice";

export type GpsStatus = "granted" | "denied" | "unavailable" | "outside";

export function useLocationPrefill() {
  const query = useQuery({
    queryKey: QK_LOCATION_PREFILL,
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      console.log("[prefill] start");
      const position = await requestBrowserPosition();
      console.log("[prefill] position", position);

      if ("lat" in position && isInEgypt(position.lat, position.lng)) {
        return { location: await resolvePoint(position.lat, position.lng), gps: "granted" as GpsStatus };
      }

      const gps: GpsStatus = "error" in position ? position.error : "outside";
      try {
        const location = await getLocationEstimate();
        console.log("[prefill] estimate ok", location);
        return { location, gps };
      } catch (error) {
        console.log("[prefill] estimate failed", error);
        throw error;
      }
    },
  });

  // لو العميل سمح بالموقع بعد ما الصفحة خلّصت (من إعدادات المتصفح) نعيد المحاولة بدل ما نفضل على تقدير الـ IP
  const { refetch } = query;
  const gps = query.data?.gps;
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    let status: PermissionStatus | undefined;
    let cancelled = false;
    const onChange = () => {
      // gps لسه undefined = الطلب الأول شغال والإذن اتدّى في نصه، مفيش داعي نكرره
      if (status?.state === "granted" && gps && gps !== "granted") void refetch();
    };
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (cancelled) return;
        status = result;
        result.addEventListener("change", onChange);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      status?.removeEventListener("change", onChange);
    };
  }, [refetch, gps]);

  return query;
}
