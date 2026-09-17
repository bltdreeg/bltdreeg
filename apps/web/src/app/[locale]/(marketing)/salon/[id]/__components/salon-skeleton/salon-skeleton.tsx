// هيكل تحميل صفحة الصالون
import { Skeleton } from "@/components/atoms/skeleton";

export function SalonSkeleton() {
  return (
    <div role="status" aria-label="جاري التحميل" className="flex flex-col gap-4">
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
