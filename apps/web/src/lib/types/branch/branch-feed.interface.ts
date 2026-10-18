// فروع البحث والفلاتر — /branches في Laravel. نفس كارت nearby + السعر وأسماء الخدمات
import type { ResolvedLocation } from "@/lib/types/geo";
import type { Paginated } from "@/lib/types/paginated.interface";
import type { NearbyBranch } from "./nearby-branch.interface";

export type BranchSort = "nearest" | "price" | "newest";

export interface BranchFilters {
  q?: string;
  governorateId?: string;
  cityId?: string;
  maxPrice?: number;
  sort?: BranchSort;
}

export interface BranchListItem extends NearbyBranch {
  /** أرخص خدمة شغالة في الصالون؛ null لو الصالون لسه مضافش خدمات */
  priceFrom: number | null;
  currency: string;
  /** أسماء أول كام خدمة (الأرخص الأول) للكارت */
  services: string[];
  isNew: boolean;
}

export interface BranchFeedPage extends Paginated<BranchListItem> {
  origin: ResolvedLocation;
}
