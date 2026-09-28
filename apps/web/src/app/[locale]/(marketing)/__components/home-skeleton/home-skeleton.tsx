import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/atoms/skeleton";

/** نفس مقاسات ShopCard: عرض مرن جوه الشبكة، صورة 4:3، فاصل متقطع */
function CardSkeleton() {
  return (
    <div className="w-full min-w-0 overflow-hidden rounded-[14px] border border-border bg-card">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-col gap-[7px] px-[17px] pt-[15px]">
        <Skeleton className="h-[15px] w-[72%]" />
        <Skeleton className="h-[11px] w-[44%]" />
        <Skeleton className="h-[11px] w-[56%]" />
      </div>
      <div className="mt-[15px] border-t border-dashed border-perforation" />
      <div className="flex items-end justify-between gap-3 px-[17px] pb-4 pt-3.5">
        <div className="flex flex-col gap-[7px]">
          <Skeleton className="h-[9px] w-[86px]" />
          <Skeleton className="h-[26px] w-[104px]" />
        </div>
        <Skeleton className="mb-1 h-3 w-[62px]" />
      </div>
    </div>
  );
}

function RailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto w-full max-w-[1312px] px-4 md:px-16">
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="mx-auto grid w-full max-w-[1312px] grid-cols-2 gap-4 px-4 md:grid-cols-4 md:px-16">
        {Array.from({ length: 4 }, (_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function HomeSkeleton() {
  const t = useTranslations("common");

  return (
    <div role="status" aria-label={t("loading")}>
      <div className="border-b border-tint-border bg-tint">
        <div className="mx-auto flex w-full max-w-[1312px] flex-col gap-8 px-4 py-8 md:flex-row md:px-16 md:py-16">
          <div className="flex flex-1 flex-col gap-4">
            <Skeleton className="h-10 w-full max-w-[520px]" />
            <Skeleton className="h-10 w-full max-w-[460px]" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-[132px] w-full shrink-0 rounded-[14px] md:w-[560px]" />
        </div>
      </div>
      {/* نفس stack الرفوف في الصفحة عشان مفيش قفزة لما البيانات توصل */}
      <div className="flex flex-col gap-8 pt-8 pb-10 md:gap-10 md:pt-10 md:pb-16">
        <RailSkeleton />
        <RailSkeleton />
      </div>
    </div>
  );
}

export { HomeSkeleton };
