"use client";

// مواعيد الدخول المتاحة على كرسي — بتتجاب بس لما العميل يختار "احجز ميعاد"
import { useQuery } from "@tanstack/react-query";
import { getChairSlots } from "@/lib/actions/reservations/reservations.action";
import { QK_CHAIR_SLOTS } from "@/lib/data/constants/query-keys.constants";

export function useChairSlots(branchId: string, chairId: string | null, enabled = true) {
  return useQuery({
    queryKey: QK_CHAIR_SLOTS(branchId, chairId ?? ""),
    queryFn: () => getChairSlots(branchId, chairId as string),
    enabled: enabled && !!chairId,
    staleTime: 30_000,
  });
}
