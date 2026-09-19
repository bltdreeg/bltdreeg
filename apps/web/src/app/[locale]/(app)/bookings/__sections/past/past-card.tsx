// كارت الحجز السابق بتصميم الفريم ١٠ في mobile.html
"use client";

import { Check, RefreshCw, Scissors, Star, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/atoms/button";
import { BookingStatus, type Booking } from "@/lib/types/booking";
import { cn } from "@/lib/utils/cn.utils";
import { formatDayLabel, formatTime } from "@/lib/utils/format/date.utils";
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
  const timeFormatted = formatTime(booking.startAt);

  return (
    <article className="rounded-2xl border border-border bg-card p-4.5 md:p-5 transition-shadow hover:shadow-xs flex flex-col gap-3.5">
      {/* ١ — شريط الرأس: الحالة والتاريخ */}
      <div className="flex items-center justify-between gap-2">
        {isCancelled ? (
          <span className="inline-flex h-6.5 items-center gap-1.5 rounded-[7px] bg-[#FDEAEA] px-2.5 text-xs font-bold text-[#B91C1C]">
            <X className="size-3.5" />
            اتلغى — ما حضرتش
          </span>
        ) : (
          <span className="inline-flex h-6.5 items-center gap-1.5 rounded-[7px] bg-[#E7F4EA] px-2.5 text-xs font-bold text-[#15803D]">
            <Check className="size-3.5 stroke-[2.5]" />
            خدمة تمّت
          </span>
        )}
        <span className="tabular text-xs font-semibold text-muted-foreground">
          {dateFormatted} — {timeFormatted}
        </span>
      </div>

      {/* ٢ — بيانات الصالون والخدمة والسعر */}
      <div className="flex gap-3.5">
        <div
          className={cn(
            "relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted",
            isCancelled && "opacity-60"
          )}
        >
          {coverImage ? (
            <Image src={coverImage} alt="" fill className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-[repeating-linear-gradient(135deg,#F7F8FA_0_8px,#EDEFF2_8px_16px)]">
              <Scissors className="size-6 text-[#C6CBD2]" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3
            className={cn(
              "truncate text-[16.5px] font-bold",
              isCancelled ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {booking.shopName}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
            <span>{booking.serviceNames.join(" + ")}</span>
            <span>·</span>
            <span>مع {booking.barberName}</span>
          </div>
          <div className="flex items-center gap-2 text-[13px]">
            <span
              className={cn(
                "tabular font-bold",
                isCancelled ? "text-muted-foreground" : "text-foreground"
              )}
            >
              {formatPrice(booking.totalPrice)}
            </span>

            {/* عرض نجوم التقييم إن وُجدت */}
            {!isCancelled && typeof booking.rating === "number" && (
              <>
                <span className="text-border">·</span>
                <div className="flex items-center gap-1 text-[12px] font-semibold text-muted-foreground">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "size-3",
                          star <= (booking.rating ?? 0)
                            ? "fill-amber-500 text-amber-500"
                            : "fill-border text-border"
                        )}
                      />
                    ))}
                  </div>
                  <span>تقييمك</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ٣ — شريط دعوة التقييم إذا لم يكن مقيّماً بعد */}
      {!isCancelled && typeof booking.rating !== "number" && (
        <div className="flex items-center gap-2 rounded-[10px] bg-[#FDF1DE] px-3.5 py-2.5 text-start">
          <Star className="size-4 shrink-0 fill-[#B45309] text-[#B45309]" />
          <span className="flex-1 text-[13px] font-bold text-[#B45309]">
            قيّم {booking.barberName} والصالون
          </span>
          <button
            type="button"
            onClick={() => onRate?.(booking)}
            className="text-[13px] font-bold text-[#B45309] underline hover:no-underline cursor-pointer"
          >
            قيّم دلوقتي
          </button>
        </div>
      )}

      {/* ٤ — زر احجز تاني بنفس الاختيارات */}
      <Button
        type="button"
        onClick={() => onRebook(booking)}
        variant={isCancelled ? "outline" : "ghost"}
        className={cn(
          "h-11 w-full gap-2 rounded-[10px] text-[14px] font-bold transition-colors cursor-pointer",
          isCancelled
            ? "border-border bg-card text-foreground hover:bg-muted"
            : "bg-tint text-primary-pressed hover:bg-tint/70"
        )}
      >
        <RefreshCw className="size-3.5 stroke-[2.2]" />
        احجز تاني بنفس الاختيارات
      </Button>
    </article>
  );
}
