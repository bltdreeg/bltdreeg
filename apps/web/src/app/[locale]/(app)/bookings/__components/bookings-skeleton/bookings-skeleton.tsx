import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/atoms/skeleton";

export function BookingsSkeleton() {
  const t = useTranslations("app.bookings");
  return (
    <div role="status" aria-label={t("loading")} className="flex flex-col gap-4">
      <Skeleton className="h-10 w-48" />
      {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 w-full" />)}
    </div>
  );
}
