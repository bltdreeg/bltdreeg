import { Scissors } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/atoms/button";
import { Star } from "@/components/atoms/rating";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import type { Shop } from "@/lib/types/shop/shop.interface";
import { cn } from "@/lib/utils/cn.utils";
import { formatDayLabel, formatTime } from "@/lib/utils/format/date.utils";
import { formatDistance, formatFrom } from "@/lib/utils/format/price.utils";

/** تأخير الصالون بالدقايق — 0 يعني في ميعاده */
export type ShopStatus = { delayMinutes: number; queueNumber: number };

type ResultRowProps = {
  shop: Shop;
  status: ShopStatus;
};

function ResultRow({ shop, status }: ResultRowProps) {
  const t = useTranslations("marketing.search.resultRow");
  const locale = useLocale();
  const late = status.delayMinutes > 0;

  return (
    <article className="group relative flex gap-3 rounded-[14px] border border-border bg-card p-3.5 transition-colors hover:border-[#CFD4DA]">
      {/* الكارت كله رابط للصالون — زر الحجز فوقه بطبقة أعلى */}
      <Link
        href={ROUTE_SALON(shop.id)}
        aria-label={shop.name}
        className="absolute inset-0 z-[1] rounded-[14px] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      />

      <div className="relative size-[76px] shrink-0 overflow-hidden rounded-[10px] bg-muted">
        {shop.coverImage ? (
          <Image src={shop.coverImage} alt="" fill sizes="76px" className="object-cover" />
        ) : (
          <Scissors
            aria-hidden
            className="absolute start-1/2 top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 text-[#C6CBD2] rtl:translate-x-1/2"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-[15px] font-bold leading-tight text-balance">{shop.name}</h3>

        {/* المنطقة · المسافة · التقييم · عدد التقييمات — سطر واحد */}
        <p className="tabular flex flex-wrap items-center gap-x-1.5 text-[13px] text-muted-foreground">
          <span>{shop.cityName}</span>
          <span aria-hidden>·</span>
          <span>{formatDistance(shop.distanceKm, locale)}</span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1 font-bold text-foreground">
            {shop.rating}
            <Star />
          </span>
          <span aria-hidden>·</span>
          <span>{t("reviews", { count: shop.reviewCount })}</span>
        </p>

        {/* الأخضر والأصفر بيظهروا لما يكون لهم معنى بس */}
        <span
          className={cn(
            "tabular w-fit rounded-[7px] px-2 py-1 text-[11.5px] font-semibold",
            late ? "bg-warning-bg text-warning-fg" : "bg-success-bg text-success-strong",
          )}
        >
          {late ? t("delayed", { minutes: status.delayMinutes }) : t("onSchedule")}
        </span>

        <span className="tabular text-[13px] font-semibold text-muted-foreground">
          {formatFrom(shop.priceFrom, locale)}
          {shop.nextSlotAt && (
            <>
              <span aria-hidden className="px-1.5">
                ·
              </span>
              {formatDayLabel(shop.nextSlotAt, locale)} {formatTime(shop.nextSlotAt, locale)}
            </>
          )}
        </span>
      </div>

      {/* خط التقطيع الرأسي: نفس توقيع التذكرة، بيفصل البيانات عن الحجز */}
      <div className="relative self-stretch">
        <div className="h-full border-s border-dashed border-perforation" />
        <span
          aria-hidden
          className="absolute -top-[22px] -start-2 size-4 rounded-full border border-border bg-background"
        />
        <span
          aria-hidden
          className="absolute -bottom-[22px] -start-2 size-4 rounded-full border border-border bg-background"
        />
      </div>

      <div className="relative z-[2] flex w-[86px] shrink-0 flex-col items-center justify-center gap-2">
        <Link
          href={ROUTE_BOOK(shop.id)}
          className={cn(buttonVariants(), "h-11 w-full rounded-[10px] text-[15px] font-bold")}
        >
          {t("book")}
        </Link>
        {/* رقم الدور معلومة مساعدة هنا — الميعاد فوق هو البطل */}
        <span className="tabular text-center text-[11.5px] font-semibold text-muted-foreground">
          {t("yourQueueWillBe", { number: status.queueNumber })}
        </span>
      </div>
    </article>
  );
}

export { ResultRow };
