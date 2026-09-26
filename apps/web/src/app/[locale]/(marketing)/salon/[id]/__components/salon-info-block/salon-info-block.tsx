"use client";

import { Heart, Navigation, Phone, Star } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { SalonDetails } from "@/lib/types/salon";
import { formatDistance } from "@/lib/utils/format/price.utils";
import { isOpenNow } from "@/lib/utils/hours.utils";
import {
  barbersOnShift,
  chairsActive,
  salonQueueTitle,
  salonReviewsWithCount,
} from "@/lib/utils/format/queue-labels.utils";
import { useFavorites } from "@/lib/hooks/favorites/use-favorites.hook";
import { useToast } from "@/components/atoms/toast";
import { ROUTE_FAVORITES } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

type SalonInfoBlockProps = {
  salon: SalonDetails;
  barbersOnShiftCount: number;
};

export function SalonInfoBlock({ salon, barbersOnShiftCount }: SalonInfoBlockProps) {
  const t = useTranslations("marketing.salon.info");
  const locale = useLocale();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const isFav = isFavorite(salon.id);

  const open = isOpenNow(salon.hours);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`;

  const tone = !open ? "neutral" : salon.queue.peopleAhead === 0 ? "success" : "warning";
  const toneClasses = {
    neutral: { bg: "bg-muted", dot: "bg-muted-foreground", text: "text-muted-foreground" },
    success: { bg: "bg-success-bg", dot: "bg-success", text: "text-success-strong" },
    warning: { bg: "bg-warning-bg", dot: "bg-warning", text: "text-warning-fg" },
  }[tone];

  const handleToggleFavorite = () => {
    toggleFavorite(salon.id);
    if (!isFav) {
      toast.success(
        t("toasts.addedTitle"),
        t("toasts.addedDesc", { name: salon.name }),
        { label: t("toasts.viewFavorites"), href: ROUTE_FAVORITES }
      );
    } else {
      toast.info(
        t("toasts.removedTitle"),
        t("toasts.removedDesc", { name: salon.name })
      );
    }
  };

  return (
    <div className="flex flex-col gap-3.5 px-4 sm:px-8 pt-4 pb-5 lg:px-0">
      <h1 className="text-[21px] font-extrabold text-foreground">{salon.name}</h1>

      <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-1 font-bold text-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="tabular">{salon.rating}</span>
          <span className="font-normal text-muted-foreground">
            {salonReviewsWithCount(salon.reviewCount, locale)}
          </span>
        </div>
        <span className="text-border">·</span>
        <span>{salon.areaName}</span>
        <span className="text-border">·</span>
        <span className="tabular">{formatDistance(salon.distanceKm, locale)}</span>
      </div>

      <div
        aria-live="polite"
        className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3.5 ${toneClasses.bg}`}
      >
        <span className={`size-2.5 shrink-0 rounded-full ${toneClasses.dot}`} />
        <div className="flex flex-col gap-0.5">
          <span className={`text-[14.5px] font-extrabold ${toneClasses.text}`}>
            {salonQueueTitle(open, salon.queue, locale)}
          </span>
          {open && (
            <span className={`text-[12.5px] font-semibold ${toneClasses.text}`}>
              {chairsActive(salon.chairsActive, locale)} · {barbersOnShift(barbersOnShiftCount, locale)}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap sm:flex-nowrap gap-2">
        {/* زر الإضافة للمفضلة */}
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={cn(
            "flex h-11 flex-1 min-w-[130px] items-center justify-center gap-1.5 rounded-xl border text-[13.5px] font-bold transition-all cursor-pointer select-none",
            isFav
              ? "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/15"
              : "border-border bg-background text-foreground hover:bg-muted"
          )}
          aria-label={isFav ? t("removeAria") : t("addAria")}
        >
          <Heart
            className={cn(
              "size-4 shrink-0 transition-colors",
              isFav ? "fill-destructive text-destructive" : "text-muted-foreground"
            )}
          />
          <span>{isFav ? t("inFavorites") : t("addToFavorites")}</span>
        </button>

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 flex-1 min-w-[100px] items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-[13.5px] font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Navigation className="size-4" />
          <span>{t("directions")}</span>
        </a>
        <a
          href={`tel:${salon.phone}`}
          className="flex h-11 flex-1 min-w-[90px] items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-[13.5px] font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Phone className="size-4" />
          <span>{t("call")}</span>
        </a>
      </div>
    </div>
  );
}
