"use client";

// نتايج البحث والفلاتر، صفحة ورا صفحة — المفتاح فيه الفلاتر والموقع، فأي تغيير بيجيب من الأول
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { getBranches } from "@/lib/actions/branches/branches.action";
import { QK_BRANCH_FEED } from "@/lib/data/constants/query-keys.constants";
import type { BranchFilters } from "@/lib/types/branch";
import type { QueryPosition } from "@/lib/utils/location/query-position";

export function useBranchFeed(
  filters: BranchFilters,
  position: QueryPosition | null,
  { enabled = true, perPage }: { enabled?: boolean; perPage?: number } = {},
) {
  return useInfiniteQuery({
    queryKey: [...QK_BRANCH_FEED(filters, position), perPage ?? null],
    queryFn: ({ pageParam }) => getBranches({ filters, position, page: pageParam, perPage }),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.lastPage ? last.page + 1 : undefined),
    // النتايج القديمة تفضل ظاهرة (باهتة) لحد ما الجديدة توصل بدل skeleton مع كل فلتر
    placeholderData: keepPreviousData,
    staleTime: 60_000,
    enabled,
  });
}
