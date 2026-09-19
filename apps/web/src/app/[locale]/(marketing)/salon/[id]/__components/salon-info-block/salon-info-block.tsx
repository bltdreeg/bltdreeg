import { Navigation, Phone, Star } from "lucide-react";
import type { SalonDetails } from "@/lib/types/salon";
import { formatDistance } from "@/lib/utils/format/price.utils";
import { isOpenNow } from "@/lib/utils/hours.utils";
import {
  barbersOnShift,
  chairsActive,
  salonQueueTitle,
  salonReviewsWithCount,
} from "@/lib/utils/format/queue-labels.utils";

type SalonInfoBlockProps = {
  salon: SalonDetails;
  barbersOnShiftCount: number;
};

export function SalonInfoBlock({ salon, barbersOnShiftCount }: SalonInfoBlockProps) {
  const open = isOpenNow(salon.hours);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(salon.address)}`;

  const tone = !open ? "neutral" : salon.queue.peopleAhead === 0 ? "success" : "warning";
  const toneClasses = {
    neutral: { bg: "bg-muted", dot: "bg-muted-foreground", text: "text-muted-foreground" },
    success: { bg: "bg-success-bg", dot: "bg-success", text: "text-success-strong" },
    warning: { bg: "bg-warning-bg", dot: "bg-warning", text: "text-warning-fg" },
  }[tone];

  return (
    <div className="flex flex-col gap-3.5 px-4 sm:px-8 pt-4 pb-5 lg:px-0">
      <h1 className="text-[21px] font-extrabold text-foreground">{salon.name}</h1>

      <div className="flex flex-wrap items-center gap-2.5 text-sm text-muted-foreground">
        <div className="flex items-center gap-1 font-bold text-foreground">
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span className="tabular">{salon.rating}</span>
          <span className="font-normal text-muted-foreground">
            {salonReviewsWithCount(salon.reviewCount)}
          </span>
        </div>
        <span className="text-border">·</span>
        <span>{salon.areaName}</span>
        <span className="text-border">·</span>
        <span className="tabular">{formatDistance(salon.distanceKm)}</span>
      </div>

      <div
        aria-live="polite"
        className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3.5 ${toneClasses.bg}`}
      >
        <span className={`size-2.5 shrink-0 rounded-full ${toneClasses.dot}`} />
        <div className="flex flex-col gap-0.5">
          <span className={`text-[14.5px] font-extrabold ${toneClasses.text}`}>
            {salonQueueTitle(open, salon.queue)}
          </span>
          {open && (
            <span className={`text-[12.5px] font-semibold ${toneClasses.text}`}>
              {chairsActive(salon.chairsActive)} · {barbersOnShift(barbersOnShiftCount)}
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-[13.5px] font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Navigation className="size-4" />
          <span>الاتجاهات</span>
        </a>
        <a
          href={`tel:${salon.phone}`}
          className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-background text-[13.5px] font-bold text-foreground transition-colors hover:bg-muted"
        >
          <Phone className="size-4" />
          <span>اتصل</span>
        </a>
      </div>
    </div>
  );
}
