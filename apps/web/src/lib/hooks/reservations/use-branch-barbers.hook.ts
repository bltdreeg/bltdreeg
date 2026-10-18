"use client";

// خطوة "اختار الحلاق": الحلاقين وطوابيرهم — بتتحدث كل دقيقة عشان طول الطابور يفضل قريب من الحقيقة
import { useQuery } from "@tanstack/react-query";
import { getBranchBarbers } from "@/lib/actions/reservations/reservations.action";
import { QK_BRANCH_BARBERS } from "@/lib/data/constants/query-keys.constants";

export function useBranchBarbers(branchId: string) {
  return useQuery({
    queryKey: QK_BRANCH_BARBERS(branchId),
    queryFn: () => getBranchBarbers(branchId),
    refetchInterval: 60_000,
    retry: (count, error) => error.status !== 404 && count < 2,
  });
}
