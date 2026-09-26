import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/atoms/skeleton";

export function BookingDetailsSkeleton() {
  const t = useTranslations("app.bookings");
  return (
    <div
      role="status"
      aria-label={t("loading")}
      className="min-h-screen bg-white"
    >
      {/* شريط مسار التنقل */}
      <div className="flex h-[60px] w-full items-center justify-between border-b border-[#E5E7EB] px-4 sm:px-8 lg:px-16">
        <div className="flex items-center gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="size-3" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-4 w-28" />
      </div>

      {/* تخطيط العمودين */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* العمود الجانبي */}
          <div className="w-full shrink-0 lg:w-[380px] flex flex-col gap-3">
            <Skeleton className="h-48 w-full rounded-[14px]" />
            <Skeleton className="h-36 w-full rounded-[14px]" />
          </div>

          {/* العمود الرئيسي */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-7 w-16 rounded-lg" />
            </div>
            <Skeleton className="h-44 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-[14px]" />
            <Skeleton className="h-32 w-full rounded-[14px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
