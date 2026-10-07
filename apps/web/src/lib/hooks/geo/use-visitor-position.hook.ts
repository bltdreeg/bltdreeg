"use client";

// إذن الموقع لأي زائر: بنطلبه أول ما يفتح الموقع، ومنستناهوش — القائمة بتتجاب من الـ IP لحد ما يسمح
import { useCallback, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { QK_VISITOR_POSITION } from "@/lib/data/constants/query-keys.constants";
import { requestBrowserPosition } from "@/lib/utils/location/browser-position";
import { toQueryPosition } from "@/lib/utils/location/query-position";
import { shouldRefetchPosition, visitorListSettled, type VisitorPermission } from "@/lib/utils/location/visitor-list-state";

export type { VisitorPermission };

export function useVisitorPosition() {
  const [permission, setPermission] = useState<VisitorPermission>(() =>
    typeof navigator !== "undefined" && !navigator.permissions?.query ? "unsupported" : null,
  );

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;
    let status: PermissionStatus | undefined;
    let cancelled = false;
    const onChange = () => status && setPermission(status.state);
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (cancelled) return;
        status = result;
        setPermission(result.state);
        result.addEventListener("change", onChange);
      })
      .catch(() => !cancelled && setPermission("unsupported"));
    return () => {
      cancelled = true;
      status?.removeEventListener("change", onChange);
    };
  }, []);

  const query = useQuery({
    queryKey: QK_VISITOR_POSITION,
    // granted بالفعل من زيارة سابقة: timeout أقصر — مفيش داعي نوري القائمة فاضية 15 ثانية لو GPS بطيء
    queryFn: () => requestBrowserPosition(permission === "granted" ? 5000 : 15000),
    // denied: المتصفح مش هيسأل تاني، فمفيش لازمة نطلب
    enabled: permission !== null && permission !== "denied",
    staleTime: Infinity,
    retry: false,
  });

  // سمح بعد ما رفض/قفل الـ prompt (من إعدادات المتصفح): نجيب الموقع تاني فالقائمة تتحدث
  const { refetch, data } = query;
  const failed = !!data && "error" in data;
  useEffect(() => {
    if (shouldRefetchPosition(permission, failed)) void refetch();
  }, [permission, failed, refetch]);

  const requestPosition = useCallback(() => void refetch(), [refetch]);

  return {
    position: toQueryPosition(data),
    permission,
    settled: visitorListSettled(permission, query.isPending),
    locating: query.isFetching,
    requestPosition,
  };
}
