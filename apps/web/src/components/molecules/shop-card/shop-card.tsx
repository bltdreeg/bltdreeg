// كارت المحل بشكل التذكرة: صورة، فاصل متقطع + خرمين، الميعاد أكبر عنصر
import { Rating } from "@/components/atoms/rating";
import { Link } from "@/i18n/navigation";
import { NextSlotLabel } from "@/components/molecules/next-slot-label";
import { ROUTE_SALON } from "@/lib/data/constants/routes.constants";
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
  // مفيش ميعاد النهارده → الكارت كله يخفت
  const dimmed = !shop.nextSlotAt || !isToday(shop.nextSlotAt);

  return (
    <Link
      href={ROUTE_SALON(shop.id)}
      className={cn(
        "group relative flex w-[250px] shrink-0 flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-all md:w-[308px]",
        "hover:-translate-y-0.5 hover:border-[#CFD4DA] hover:shadow-[0_8px_22px_rgba(14,15,17,0.09)]",
        "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      {/* 1 — صورة 4:3 نضيفة، مفيش نص فوقها غير زر الحفظ */}
      <div
        className={cn(
          "relative aspect-[4/3] w-full bg-muted",
          "bg-[repeating-linear-gradient(135deg,#F7F8FA_0_9px,#EDEFF2_9px_18px)]",
          dimmed && "opacity-60",
        )}
      >
        {shop.isNew && (
          <span className="absolute top-3 end-3 rounded-[7px] bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
            جديد
          </span>
        )}
      </div>

      {/* 2 — الاسم ثم المنطقة والمسافة ثم التقييم: ٣ سطور ثابتة */}
      <div className="flex flex-col gap-[7px] px-[17px] pt-[15px]">
        <h3
          className={cn(
            "truncate text-[15.5px] font-bold leading-tight md:text-[17px]",
            dimmed && "text-muted-foreground",
          )}
        >
          {shop.name}
        </h3>
        <p className="tabular text-[13px] text-muted-foreground">
          {shop.areaName} · {formatDistance(shop.distanceKm)}
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
      <div className="flex items-end justify-between gap-3 px-[17px] pb-4 pt-3.5">
        <NextSlotLabel slotAt={shop.nextSlotAt} muted={dimmed} />
        <span
          className={cn(
            "tabular whitespace-nowrap pb-1 text-[13px] font-semibold",
            dimmed ? "text-disabled-fg" : "text-muted-foreground",
          )}
        >
          {formatFrom(shop.priceFrom)}
        </span>
      </div>
    </Link>
  );
}

export { ShopCard };
