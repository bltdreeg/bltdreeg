// كارت الصالون المفضل بتصميم التذكرة من FRAME 12B
"use client";

import { Scissors, X } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK, ROUTE_SALON } from "@/lib/data/constants/routes.constants";
import type { Shop } from "@/lib/types/shop/shop.interface";
import { cn } from "@/lib/utils/cn.utils";
import { formatTime, isToday } from "@/lib/utils/format/date.utils";
import { formatDistance, formatFrom } from "@/lib/utils/format/price.utils";

type FavoriteCardProps = {
  shop: Shop;
  onRemove?: (shopId: string) => void;
  notchColor?: string;
  className?: string;
};

export function FavoriteCard({
  shop,
  onRemove,
  notchColor = "var(--color-card, #ffffff)",
  className,
}: FavoriteCardProps) {
  const t = useTranslations("marketing.favorites.card");
  const locale = useLocale();
  const hasSlotToday = Boolean(shop.nextSlotAt && isToday(shop.nextSlotAt));
  const slotTimeFormatted = shop.nextSlotAt
    ? formatTime(shop.nextSlotAt, locale)
    : (locale === "ar" ? "1:15 م" : "1:15 PM");

  return (
    <article
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-[14px] border border-border bg-card transition-all",
        "hover:-translate-y-0.5 hover:border-[#CFD4DA] hover:shadow-[0_8px_22px_rgba(14,15,17,0.08)]",
        className
      )}
    >
      {/* طبقة الرابط للصالون */}
      <Link
        href={ROUTE_SALON(shop.id)}
        aria-label={shop.name}
        className="absolute inset-0 z-[1] focus:outline-none"
      />

      {/* 1 — صورة الغلاف مع شارة المفضلة */}
      <div
        className={cn(
          "relative h-[180px] w-full overflow-hidden bg-muted",
          !shop.coverImage &&
            "bg-[repeating-linear-gradient(135deg,#F7F8FA_0_9px,#EDEFF2_9px_18px)]"
        )}
      >
        {shop.coverImage ? (
          <Image
            src={shop.coverImage}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <Scissors
            aria-hidden
            className="absolute left-1/2 top-1/2 size-7 -translate-x-1/2 -translate-y-1/2 text-[#C6CBD2]"
          />
        )}

        {/* شارة المفضلة (أعلى اليسار) */}
        <div
          aria-hidden
          className="absolute start-3 top-3 z-[2] flex size-8 items-center justify-center rounded-[9px] bg-white/95 shadow-xs"
        >
          <div className="size-3 rounded-[3px] bg-primary" />
        </div>
      </div>

      {/* 2 — بيانات المحل: الاسم والمنطقة والتقييم */}
      <div className="flex flex-col gap-1.5 px-[17px] pt-[15px]">
        <h3 className="truncate text-[17px] font-bold text-foreground">
          {shop.name}
        </h3>
        <p className="tabular text-[13px] text-muted-foreground">
          {shop.cityName} · {formatDistance(shop.distanceKm, locale)} · {shop.rating}
        </p>
      </div>

      {/* 3 — خط التقطيع + خرمي التذكرة */}
      <div className="relative mt-3.5">
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

      {/* 4 — ميعاد الحجز والسعر */}
      <div className="flex flex-col gap-3 p-[14px_17px_16px]">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[11.5px] font-semibold text-muted-foreground tracking-wide">
              {hasSlotToday ? t("nearestSlotToday") : t("noSlotsToday")}
            </span>
            <span
              className={cn(
                "tabular text-[28px] font-bold leading-none",
                hasSlotToday ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {hasSlotToday ? slotTimeFormatted : (locale === "ar" ? "بكرة 11:00 ص" : "Tomorrow 11:00 AM")}
            </span>
          </div>

          {hasSlotToday && (
            <span className="tabular pb-1 text-[13px] font-semibold text-muted-foreground whitespace-nowrap">
              {formatFrom(shop.priceFrom, locale)}
            </span>
          )}
        </div>

        {/* 5 — أزرار الإجراءات: زر الحجز وزر الحذف من المفضلة */}
        <div className="relative z-[2] flex items-center gap-2">
          {hasSlotToday ? (
            <Link
              href={ROUTE_BOOK(shop.id)}
              className="flex h-[42px] flex-1 items-center justify-center rounded-[10px] bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-primary-pressed whitespace-nowrap"
            >
              {t("bookAppointment")}
            </Link>
          ) : (
            <Link
              href={ROUTE_BOOK(shop.id)}
              className="flex h-[42px] flex-1 items-center justify-center rounded-[10px] border border-primary bg-card text-sm font-bold text-primary-pressed transition-colors hover:bg-primary/10 whitespace-nowrap"
            >
              {t("seeTomorrowSlots")}
            </Link>
          )}

          {/* زر حذف من المفضلة */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onRemove?.(shop.id);
            }}
            aria-label={t("removeAria", { name: shop.name })}
            className="flex size-[42px] shrink-0 items-center justify-center rounded-[10px] border border-border bg-card text-muted-foreground transition-colors hover:border-destructive/60 hover:bg-destructive/10 hover:text-destructive cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

