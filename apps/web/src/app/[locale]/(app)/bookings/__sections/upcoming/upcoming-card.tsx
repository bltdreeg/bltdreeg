// كارت الحجز القادم بتصميم FRAME 10A
"use client";

import { Scissors } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/atoms/button";
import { ROUTE_BOOKING_DETAILS } from "@/lib/data/constants/routes.constants";
import type { Booking } from "@/lib/types/booking";
import { cn } from "@/lib/utils/cn.utils";
import { formatDayLabel, formatTime, isToday } from "@/lib/utils/format/date.utils";

interface UpcomingCardProps {
  booking: Booking;
  onCancel: (booking: Booking) => void;
  coverImage?: string;
}

export function UpcomingCard({
  booking,
  onCancel,
  coverImage,
}: UpcomingCardProps) {
  const isBookingToday = isToday(booking.startAt);
  const timeFormatted = formatTime(booking.startAt);
  const dateFormatted = formatDayLabel(booking.startAt);
  const servicesText = `${booking.serviceNames.join(" + ")} · مع ${booking.barberName} · ${booking.durationMinutes} دقيقة`;
  const codeText = booking.bookingCode ? `كود الحجز ${booking.bookingCode}` : `رقم الحجز #${booking.id.slice(-6)}`;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl bg-card transition-shadow shadow-xs",
        isBookingToday ? "border-2 border-primary" : "border border-border"
      )}
    >
      {/* 1 — شريط الرأس: التاريخ والحالة والكود */}
      <div
        className={cn(
          "flex flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-6",
          isBookingToday
            ? "border-b border-tint-border bg-tint text-primary-pressed"
            : "border-b border-border bg-muted/50 text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2.5">
          {isBookingToday ? (
            <span className="flex h-6.5 items-center justify-center rounded-[7px] bg-primary px-2.5 text-[12.5px] font-bold text-primary-foreground">
              النهارده
            </span>
          ) : (
            <span className="flex h-6.5 items-center justify-center rounded-[7px] border border-tint-border bg-card px-2.5 text-[12.5px] font-bold text-primary-pressed">
              مؤكد
            </span>
          )}
          <span
            className={cn(
              "tabular text-[13px] font-semibold",
              isBookingToday ? "text-primary-pressed" : "text-muted-foreground"
            )}
          >
            {dateFormatted}
          </span>
        </div>

        <span
          className={cn(
            "tabular text-[12.5px]",
            isBookingToday ? "font-semibold text-primary-pressed" : "text-muted-foreground"
          )}
        >
          {codeText}
        </span>
      </div>

      {/* 2 — محتوى الكارت: تفاصيل الصالون والخدمة + التذكرة بالأرقام */}
      <div className="flex flex-col lg:flex-row lg:items-stretch">
        {/* الجانب الأيمن: بيانات الصالون وتأخير الطابور والأزرار */}
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-5 md:p-6">
          <div className="flex flex-col gap-3.5">
            <div className="flex items-center gap-3.5">
              {/* صورة الصالون أو أيقونة بديلة */}
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
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

              {/* اسم الصالون والخدمات */}
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h3 className="truncate text-lg font-bold text-foreground">
                  {booking.shopName}
                </h3>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {servicesText}
                </p>
              </div>
            </div>

            {/* شريط حالة الطابور المباشر لحجز اليوم */}
            {isBookingToday && (
              <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-[#DCFCE7] bg-[#F6FEF9] p-3 text-start">
                <span className="size-2 shrink-0 rounded-full bg-[#16A34A]" />
                <span className="text-[13.5px] font-bold text-[#15803D]">
                  الصالون ماشي في ميعاده
                </span>
                <span className="tabular text-[12.5px] text-muted-foreground">
                  متوسط تأخير النهارده 4 دقايق · دورك تقريبًا {timeFormatted}
                </span>
              </div>
            )}
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {isBookingToday && (
              <Link
                href={ROUTE_BOOKING_DETAILS(booking.id)}
                className="inline-flex h-11 items-center justify-center rounded-[10px] bg-primary px-5 text-[14.5px] font-bold text-primary-foreground transition-colors hover:bg-primary-pressed whitespace-nowrap"
              >
                تابع ميعادك
              </Link>
            )}

            <Link
              href={ROUTE_BOOKING_DETAILS(booking.id)}
              className="inline-flex h-11 items-center justify-center rounded-[10px] border border-border bg-card px-4.5 text-[14.5px] font-bold text-foreground transition-colors hover:bg-muted whitespace-nowrap"
            >
              تفاصيل
            </Link>

            <Button
              type="button"
              variant="ghost"
              onClick={() => onCancel(booking)}
              className="h-11 px-3.5 text-[14.5px] font-bold text-destructive hover:bg-destructive/10 hover:text-destructive whitespace-nowrap"
            >
              إلغاء
            </Button>
          </div>
        </div>

        {/* خط التقطيع العمودي */}
        <div
          aria-hidden
          className="hidden w-px shrink-0 bg-[repeating-linear-gradient(#D9DDE2_0_5px,transparent_5px_10px)] lg:my-5 lg:block"
        />

        {/* الجانب الأيسر: ميعادك ورقمك في الدور (التذكرة) */}
        <div className="flex shrink-0 divide-x divide-x-reverse divide-border/60 border-t border-dashed border-border p-5 lg:w-[430px] lg:border-t-0 lg:p-6">
          {/* الميعاد */}
          <div className="flex flex-1 flex-col gap-2 pe-4">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">
              ميعادك
            </span>
            <span className="tabular text-[30px] font-extrabold leading-none text-foreground md:text-[34px]">
              {timeFormatted}
            </span>
            <span className="text-[12.5px] text-muted-foreground">
              {isBookingToday ? "النهارده" : dateFormatted}
            </span>
          </div>

          {/* رقمك في الدور */}
          <div className="flex flex-1 flex-col gap-2 ps-4">
            <span className="text-xs font-semibold tracking-wider text-muted-foreground">
              رقمك في الدور
            </span>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-[62px] shrink-0 items-center justify-center rounded-[13px] border-2",
                  isBookingToday
                    ? "border-primary bg-tint text-primary-pressed"
                    : "border-border bg-muted/40 text-foreground"
                )}
              >
                <span className="tabular text-4xl font-extrabold">
                  {booking.queueNumber}
                </span>
              </div>
              <span className="text-[12.5px] leading-relaxed text-muted-foreground">
                {isBookingToday ? (
                  <>
                    قدامك {Math.max(0, booking.queueNumber - 1)}
                    <br />
                    في الدور
                  </>
                ) : (
                  <>
                    الدور بيبقى حيّ
                    <br />
                    يوم الميعاد
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

