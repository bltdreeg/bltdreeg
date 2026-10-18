// ترتيب المحافظات في "استكشف حسب المنطقة": السوق الأساسي الأول (القاهرة والجيزة)، والباقي بترتيب الـ API
import type { GeoDivision } from "../../types/geo/index.ts";

/** القاهرة، الجيزة، الإسكندرية — أكواد Laravel /geo */
export const PRIORITY_GOVERNORATE_IDS = ["EG01", "EG21", "EG02"] as const;

export function orderGovernorates<T extends Pick<GeoDivision, "id">>(governorates: T[]): T[] {
  const rank = (id: string) => {
    const index = (PRIORITY_GOVERNORATE_IDS as readonly string[]).indexOf(id);
    return index === -1 ? PRIORITY_GOVERNORATE_IDS.length : index;
  };
  // sort ثابت: اللي مش في الأولوية بيفضل بترتيبه الأصلي
  return [...governorates].sort((a, b) => rank(a.id) - rank(b.id));
}
