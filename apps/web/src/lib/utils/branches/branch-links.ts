// روابط خارجية للفرع — مفصولة عن الكومبوننتات عشان تتختبر
import type { BranchDetail } from "../../types/branch/index.ts";

/** لينك الخريطة اللي صاحب الصالون حطه، وإلا بحث جوجل ماب بالإحداثيات */
export function branchDirectionsUrl(branch: Pick<BranchDetail, "mapsUrl" | "lat" | "lng">): string {
  return branch.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${branch.lat},${branch.lng}`;
}
