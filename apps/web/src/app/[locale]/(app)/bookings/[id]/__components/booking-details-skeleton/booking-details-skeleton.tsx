// هيكل تحميل تفاصيل الحجز
import { Skeleton } from "@/components/atoms/skeleton";

export function BookingDetailsSkeleton() {
  return (
    <div role="status" aria-label="جاري التحميل" className="flex flex-col gap-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-6 w-1/2" />
    </div>
  );
}
