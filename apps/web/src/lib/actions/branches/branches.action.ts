// فروع الصالونات — /branches في Laravel (عام، من غير login)
import { apiClient } from "@/lib/api";
import type { BranchDetail, BranchFeedPage, BranchFilters, NearbyBranchesPage } from "@/lib/types/branch";
import {
  mapBranchDetail,
  mapBranchFeedPage,
  mapNearbyBranchesPage,
  toBranchFeedParams,
  type RawBranchDetail,
  type RawBranchFeedPage,
  type RawNearbyBranchesPage,
} from "@/lib/utils/branches/branch-mapper";
import type { QueryPosition } from "@/lib/utils/location/query-position";

export async function getNearbyBranches(params: {
  position: QueryPosition | null;
  page: number;
  perPage?: number;
}): Promise<NearbyBranchesPage> {
  const response = await apiClient.get<RawNearbyBranchesPage>("/branches/nearby", {
    params: {
      page: params.page,
      per_page: params.perPage,
      // من غير إحداثيات السيرفر بيرتّب من الـ IP
      ...(params.position ?? {}),
    },
  });
  return mapNearbyBranchesPage(response);
}

/** البحث والفلاتر — نفس منطق الـ origin بتاع nearby للمسافة */
export async function getBranches(params: {
  filters: BranchFilters;
  position: QueryPosition | null;
  page: number;
  perPage?: number;
}): Promise<BranchFeedPage> {
  const response = await apiClient.get<RawBranchFeedPage>("/branches", {
    params: {
      ...toBranchFeedParams(params.filters),
      page: params.page,
      per_page: params.perPage,
      ...(params.position ?? {}),
    },
  });
  return mapBranchFeedPage(response);
}

/** صفحة الصالون؛ الموقع اختياري (للمسافة بس). فرع مش ظاهر بيرجع 404 كـ ApiError */
export async function getBranch(id: string, position: QueryPosition | null): Promise<BranchDetail> {
  const response = await apiClient.get<RawBranchDetail>(`/branches/${encodeURIComponent(id)}`, {
    params: position ?? {},
  });
  return mapBranchDetail(response);
}
