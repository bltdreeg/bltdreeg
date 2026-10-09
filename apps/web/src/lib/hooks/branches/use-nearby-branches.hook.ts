"use client";

// قائمة الفروع بالأقرب، صفحة ورا صفحة — بتتجاب تاني لوحدها لما الإحداثيات توصل
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getNearbyBranches } from "@/lib/actions/branches/branches.action";
import { QK_NEARBY_BRANCHES } from "@/lib/data/constants/query-keys.constants";
import type { QueryPosition } from "@/lib/utils/location/query-position";

export function useNearbyBranches(position: QueryPosition | null, enabled = true) {
  return useInfiniteQuery({
    queryKey: QK_NEARBY_BRANCHES(position),
    queryFn: ({ pageParam }) => getNearbyBranches({ position, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.lastPage ? last.page + 1 : undefined),
    // القائمة القديمة (من الـ IP) تفضل ظاهرة لحد ما بتاعة الـ GPS توصل — من غير skeleton في النص
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    enabled,
  });
}
