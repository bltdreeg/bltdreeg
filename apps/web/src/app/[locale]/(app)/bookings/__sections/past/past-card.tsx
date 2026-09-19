// كارت الحجز السابق بتصميم FRAME 10B
"use client";

import { Scissors, Star } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/atoms/button";
import { BookingStatus, type Booking } from "@/lib/types/booking";
import { cn } from "@/lib/utils/cn.utils";
import { formatDayLabel } from "@/lib/utils/format/date.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";

interface PastCardProps {
  booking: Booking;
  onRebook: (booking: Booking) => void;
  onRate?: (booking: Booking) => void;
  coverImage?: string;
}

export function PastCard({
  booking,
  onRebook,
  onRate,
  coverImage,
}: PastCardProps) {
  const isCancelled = booking.status === BookingStatus.CANCELLED;
  const dateFormatted = formatDayLabel(booking.startAt);
  const servicesText = `${booking.serviceNames.join(" + ")} · مع ${booking.barberName}`;

  return (
    <article className="flex flex-col gap-4 rounded-[14px] border border-border bg-card p-4.5 transition-shadow hover:shadow-xs md:flex-row md:items-center md:gap-5 md:p-[18px_22px]">
      {/* 1 — صورة الصالون */}
      <div
        className={cn(
          "relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted",
          isCancelled && "opacity-65"
        )}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt=""
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[repeating-linear-gradient(135deg,#F7F8FA_0_8px,#EDEFF2_8px_16px)]">
            <Scissors className="size-6 text-[#C6CBD2]" />
          </div>
        )}
      </div>

      {/* 2 — الاسم والحالة والخدمات */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3
            className={cn(
              "truncate text-[17px] font-bold leading-tight",
              isCancelled ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {booking.shopName}
          </h3>

          {isCancelled ? (
            <span className="inline-flex h-6 items-center justify-center rounded-[7px] border border-destructive/30 bg-destructive/10 px-2.5 text-xs font-bold text-destructive whitespace-nowrap">
              اتلغى — ما حضرتش
            </span>
          ) : (
            <span className="inline-flex h-6 items-center justify-center rounded-[7px] bg-[#DCFCE7] px-2.5 text-xs font-bold text-[#15803D] whitespace-nowrap">
              تم
            </span>
          )}
        </div>

        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {servicesText}
        </p>
      </div>

      {/* 3 — التاريخ والسعر */}
      <div className="flex shrink-0 flex-col gap-1.5 border-border md:w-[170px] md:border-s md:ps-5">
        <span className="tabular text-xs font-semibold text-muted-foreground">
          {dateFormatted}
        </span>
        <span
          className={cn(
            "tabular text-xl font-extrabold leading-none",
            isCancelled ? "text-muted-foreground" : "text-foreground"
          )}
        >
          {formatPrice(booking.totalPrice)}
        </span>
      </div>

      {/* 4 — أزرار الإجراءات والتقييم */}
      <div className="flex shrink-0 flex-wrap items-center gap-2.5 md:gap-3">
        {/* زر إعادة الحجز */}
        <Button
          type="button"
          onClick={() => onRebook(booking)}
          variant={isCancelled ? "outline" : "default"}
          className={cn(
            "h-11 rounded-[10px] px-5 text-[14.5px] font-bold whitespace-nowrap",
            isCancelled
              ? "border-primary text-primary hover:bg-primary/10"
              : "bg-primary text-primary-foreground hover:bg-primary-pressed"
          )}
        >
          احجز نفس الحجز
        </Button>

        {/* عرض التقييم أو زر تقييم */}
        {!isCancelled && (
          <>
            {typeof booking.rating === "number" ? (
              <div className="flex flex-col items-start gap-1.5 px-2">
                <span className="text-[11.5px] font-semibold text-muted-foreground">
                  تقييمك
                </span>
                <div className="flex items-center gap-1" aria-label={`تقييمك ${booking.rating} من 5`}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "size-3.5",
                        star <= (booking.rating ?? 0)
                          ? "fill-foreground text-foreground"
                          : "fill-border text-border"
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => onRate?.(booking)}
                className="h-11 rounded-[10px] border-border bg-card px-5 text-[14.5px] font-bold text-foreground hover:bg-muted whitespace-nowrap"
              >
                قيّم
              </Button>
            )}
          </>
        )}
      </div>
    </article>
  );
}
