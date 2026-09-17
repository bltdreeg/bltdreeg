// هيكل تحميل المفضلة
import { Skeleton } from "@/components/atoms/skeleton";

export function FavoritesSkeleton() {
  return (
    <div role="status" aria-label="جاري التحميل" className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-56" />)}
      </div>
    </div>
  );
}
