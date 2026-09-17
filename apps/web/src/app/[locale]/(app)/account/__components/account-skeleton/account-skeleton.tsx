// هيكل تحميل حسابي
import { Skeleton } from "@/components/atoms/skeleton";

export function AccountSkeleton() {
  return (
    <div role="status" aria-label="جاري التحميل" className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-16 rounded-full" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      {Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-12 w-full" />)}
    </div>
  );
}
