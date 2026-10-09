// أقرب الفروع للزائر — /branches/nearby في Laravel (عام، من غير login)
import { apiClient } from "@/lib/api";
import type { NearbyBranchesPage } from "@/lib/types/branch";
import { mapNearbyBranchesPage, type RawNearbyBranchesPage } from "@/lib/utils/branches/branch-mapper";
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
