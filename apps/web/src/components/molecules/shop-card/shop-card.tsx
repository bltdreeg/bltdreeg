import { Scissors } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/atoms/button";
import { Rating } from "@/components/atoms/rating";
import { Link } from "@/i18n/navigation";
import { NextSlotLabel } from "@/components/molecules/next-slot-label";
import { ROUTE_BOOK, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import type { Shop } from "@/lib/types/shop/shop.interface";
import { cn } from "@/lib/utils/cn.utils";
import { isToday } from "@/lib/utils/format/date.utils";
import { formatDistance, formatFrom } from "@/lib/utils/format/price.utils";

type ShopCardProps = {
  shop: Shop;
  /**
   * لون خلفية الأب — الخرمين بيتملوا بيه عشان يبانوا مقصوصين.
   * الافتراضي أبيض زي الرئيسية؛ في شيت التصميم الكارت على #F7F8FA.
   */
  notchColor?: string;
  className?: string;
};

function ShopCard({ shop, notchColor = "var(--background)", className }: ShopCardProps) {
  const t = useTranslations("common.shopCard");
  const locale = useLocale();
  // مفيش ميعاد النهارده → الكارت كله يخفت
  const dimmed = !shop.nextSlotAt || !isToday(shop.nextSlotAt);

  return (
    <article
      className={cn(
        "group relative flex w-full min-w-0 flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-all",
        "hover:-translate-y-0.5 hover:border-[#CFD4DA] hover:shadow-[0_8px_22px_rgba(14,15,17,0.09)]",
        "focus-within:ring-3 focus-within:ring-ring/50",
        className,
      )}
    >
      {/* الكارت كله رابط للصالون — طبقة شفافة تحت زر الحجز */}
      <Link
        href={ROUTE_SALON(shop.id)}
        aria-label={shop.name}
        className="absolute inset-0 z-[1] focus:outline-none"
      />
      {/* 1 — صورة 4:3 نضيفة، مفيش نص فوقها غير زر الحفظ */}
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden bg-muted",
          !shop.coverImage &&
            "bg-[repeating-linear-gradient(135deg,#F7F8FA_0_9px,#EDEFF2_9px_18px)]",
        )}
      >
        {shop.coverImage ? (
          <Image
            src={shop.coverImage}
            alt=""
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover"
          />
        ) : (
          // لسه مفيش صور — أيقونة خفيفة أحسن من مستطيل رمادي فاضي
          <Scissors
            aria-hidden
            className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 text-[#C6CBD2]"
          />
        )}
        {shop.isNew && (
          <span className="absolute top-3 end-3 rounded-[7px] bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            {t("newBadge")}
          </span>
        )}
      </div>

      {/* 2 — الاسم ثم المنطقة والمسافة ثم التقييم: ٣ سطور ثابتة */}
      <div className="flex flex-col gap-[7px] px-3 pt-3 sm:px-[17px] sm:pt-[15px]">
        <h3
          className={cn(
            "truncate text-[15px] font-bold leading-tight md:text-[17px]",
            dimmed && "text-muted-foreground",
          )}
        >
          {shop.name}
        </h3>
        <p className="tabular text-xs sm:text-[13px] text-muted-foreground">
          {shop.areaName} · {formatDistance(shop.distanceKm, locale)}
        </p>
        <Rating value={shop.rating} count={shop.reviewCount} />
      </div>

      {/* 3 — خط التقطيع + خرمين: التوقيع البصري للتذكرة */}
      <div className="relative mt-[15px]">
        <div className="border-t border-dashed border-perforation" />
        <span
          aria-hidden
          className="absolute -top-2 -end-[9px] size-4 rounded-full border border-border"
          style={{ background: notchColor }}
        />
        <span
          aria-hidden
          className="absolute -top-2 -start-[9px] size-4 rounded-full border border-border"
          style={{ background: notchColor }}
        />
      </div>

      {/* 4 و 5 — الميعاد أكبر عنصر، والسعر معلومة مساعدة */}
      <div className="flex items-end justify-between gap-2 sm:gap-3 px-3 pb-3.5 pt-3 sm:px-[17px] sm:pb-4 sm:pt-3.5">
        <NextSlotLabel slotAt={shop.nextSlotAt} muted={dimmed} />
        <span
          className={cn(
            "tabular whitespace-nowrap pb-1 text-xs sm:text-[13px] font-semibold",
            dimmed ? "text-disabled-fg" : "text-muted-foreground",
          )}
        >
          {formatFrom(shop.priceFrom, locale)}
        </span>
      </div>

      {/* 6 — زر الحجز: فوق طبقة الرابط عشان يتضغط لوحده */}
      <div className="relative z-[2] px-3 pb-3.5 sm:px-[17px] sm:pb-[17px]">
        <Link
          href={ROUTE_BOOK(shop.id)}
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-11 sm:h-12 w-full rounded-xl text-sm sm:text-[15px] font-bold",
          )}
        >
          {t("bookAppointment")}
        </Link>
      </div>
    </article>
  );
}

export { ShopCard };
