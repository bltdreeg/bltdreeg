"use client";
// هيكل تحميل صفحة الصالون — بيطابق التخطيط الحقيقي (عمودين) عشان مفيش قفز لما يتحمّل
import { useTranslations } from "next-intl";
import { PageContainer } from "@/components/atoms/page-container";
import { Skeleton } from "@/components/atoms/skeleton";

export function SalonSkeleton() {
  const t = useTranslations("common");

  return (
    <div role="status" aria-label={t("loading")} className="flex flex-col gap-0">
      {/* الجاليري */}
      <Skeleton className="h-[320px] w-full rounded-none" />

      <PageContainer>
        {/* الهيدر */}
        <div className="flex flex-col gap-3 py-6">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <div className="flex gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </div>

        {/* شريط الأقسام */}
        <div className="flex gap-6 border-b border-border pb-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-5 w-16" />
          ))}
        </div>

        {/* المحتوى — عمودين */}
        <div className="flex flex-col gap-6 py-8 lg:flex-row lg:items-start">
          {/* العمود الرئيسي */}
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <Skeleton className="h-52 w-full rounded-[14px]" />
            <Skeleton className="h-44 w-full rounded-[14px]" />
            <Skeleton className="h-64 w-full rounded-[14px]" />
          </div>
          {/* الشريط الجانبي */}
          <div className="w-full shrink-0 lg:w-95">
            <Skeleton className="h-72 w-full rounded-[14px]" />
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
