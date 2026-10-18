"use client";

// صفحة الصالون — الموقع في المفتاح عشان المسافة؛ لما الـ GPS يوصل بنجيب تاني والقديم يفضل ظاهر
import { useQuery } from "@tanstack/react-query";
import { getBranch } from "@/lib/actions/branches/branches.action";
import { QK_BRANCH } from "@/lib/data/constants/query-keys.constants";
import type { QueryPosition } from "@/lib/utils/location/query-position";

export function useBranch(id: string, position: QueryPosition | null) {
  return useQuery({
    queryKey: [...QK_BRANCH(id), position ? `${position.lat},${position.lng}` : "none"],
    queryFn: () => getBranch(id, position),
    staleTime: 5 * 60_000,
    // بس لنفس الفرع — التنقل لصالون تاني ميعرضش بيانات الصالون اللي قبله
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[2] === id ? previous : undefined),
    // 404 (فرع مش موجود أو مخفي) نهائي — مفيش لازمة نعيد
    retry: (count, error) => error.status !== 404 && count < 2,
  });
}
