// هيكل تحميل حجوزاتي
import { Skeleton } from "@/components/atoms/skeleton";

export function BookingsSkeleton() {
  return (
    <div role="status" aria-label="جاري التحميل" className="flex flex-col gap-4">
      <Skeleton className="h-10 w-48" />
      {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 w-full" />)}
    </div>
  );
}
