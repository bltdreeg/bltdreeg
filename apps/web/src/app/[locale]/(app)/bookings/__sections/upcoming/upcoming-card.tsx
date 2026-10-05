// كارت الحجز القادم والحي بتصميم الفريم ٠٩ في mobile.html
"use client";

import { Clock, Scissors } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/atoms/button";
import { useTranslations } from "next-intl";
import { ROUTE_BOOKING_DETAILS } from "@/lib/data/constants/routes.constants";
import { BookingStatus, type Booking } from "@/lib/types/booking";
import { formatDayLabel, formatTime, isToday } from "@/lib/utils/format/date.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";

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
  const t = useTranslations("app.bookings");
  const isBookingToday = isToday(booking.startAt);

  // ١. كارت الدور النشط في حال حجز اليوم (Active Queue Card مطابقة للفريم ٠٩)
  if (isBookingToday) {
    const peopleAhead = Math.max(0, booking.queueNumber - 1);
    const estimatedMinutes = Math.max(10, peopleAhead * 10);

    return (
      <article className="rounded-2xl border border-tint-border bg-tint p-5 md:p-6 transition-shadow shadow-xs">
        {/* شريط الحالة والاسم */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[13px] font-extrabold text-primary-pressed">
              {t("activeQueue.liveStatus")}
            </span>
          </div>
          <span className="text-[13px] font-bold text-primary-pressed truncate">
            {booking.shopName}
          </span>
        </div>

        {/* أرقام الدور والانتظار */}
        <div className="mb-4.5 flex items-end gap-5">
          <div>
            <div className="mb-1 text-[12px] font-bold text-primary-pressed">
              {t("activeQueue.queueNumberLabel")}
            </div>
            <div className="tabular text-[48px] md:text-[52px] font-extrabold leading-none text-primary">
              {booking.queueNumber}
            </div>
          </div>
          <div className="h-12 w-px bg-tint-border" />
          <div className="pb-1">
            <div className="mb-1 text-[12px] font-bold text-primary-pressed">
              {t("activeQueue.aheadLabel")}
            </div>
            <div className="text-[18px] md:text-[19px] font-extrabold text-primary-pressed">
              <span className="tabular">{t("activeQueue.peopleAhead", { count: peopleAhead })}</span>{" "}
              <span className="text-[14.5px] font-semibold text-primary-pressed/80 tabular">
                {t("activeQueue.minutesEstimated", { count: estimatedMinutes })}
              </span>
            </div>
          </div>
        </div>

        {/* تفاصيل الخدمات والحلاق والسعر */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-[12.5px] font-semibold text-primary-pressed">
          <span>{booking.serviceNames.join(" + ")}</span>
          <span className="text-tint-border">|</span>
          <span>{t("withBarber", { name: booking.barberName })}</span>
          <span className="text-tint-border">|</span>
          <span className="tabular font-bold">{formatPrice(booking.totalPrice)}</span>
        </div>

        {/* زر تابع دورك */}
        <Link
          href={ROUTE_BOOKING_DETAILS(booking.id)}
          className="flex h-12 w-full items-center justify-center rounded-[10px] bg-primary text-[15px] font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary-pressed"
        >
          {t("activeQueue.trackQueue")}
        </Link>
      </article>
    );
  }

  // ٢. كارت الحجز المنتظر أو المجدول مستقبلاً (Pending Card مطابقة للفريم ٠٩)
  const isWaiting = booking.status === BookingStatus.WAITING;

  return (
    <article className="rounded-2xl border border-border bg-card p-4.5 md:p-5 transition-shadow hover:shadow-xs">
      {/* شريط الحالة والوقت */}
      <div className="mb-3 flex items-center justify-between gap-2">
        {isWaiting ? (
          <span className="inline-flex h-6.5 items-center gap-1.5 rounded-[7px] bg-[#FDF1DE] px-2.5 text-[12px] font-bold text-[#B45309]">
            <Clock className="size-3.5" />
            {t("status.waiting")}
          </span>
        ) : (
          <span className="inline-flex h-6.5 items-center gap-1.5 rounded-[7px] border border-tint-border bg-tint px-2.5 text-[12px] font-bold text-primary-pressed">
            <Clock className="size-3.5" />
            {t("status.confirmed")}
          </span>
        )}
        <span className="tabular text-xs font-semibold text-muted-foreground">
          {formatDayLabel(booking.startAt)} — {formatTime(booking.startAt)}
        </span>
      </div>

      {/* بيانات الصالون والخدمة */}
      <div className="flex gap-3.5">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          {coverImage ? (
            <Image src={coverImage} alt="" fill className="object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center bg-[repeating-linear-gradient(135deg,#F7F8FA_0_8px,#EDEFF2_8px_16px)]">
              <Scissors className="size-6 text-[#C6CBD2]" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="truncate text-[16.5px] font-bold text-foreground">
            {booking.shopName}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
            <span>{booking.serviceNames.join(" + ")}</span>
            <span>·</span>
            <span>{t("withBarber", { name: booking.barberName })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-foreground">
            <span className="tabular">{formatPrice(booking.totalPrice)}</span>
          </div>
        </div>
      </div>

      {/* أزرار الإجراءات */}
      <div className="mt-3.5 flex gap-2.5">
        <Link
          href={ROUTE_BOOKING_DETAILS(booking.id)}
          className="flex h-11 flex-1 items-center justify-center rounded-[10px] border border-border bg-card text-[14px] font-bold text-foreground transition-colors hover:bg-muted"
        >
          {t("bookingDetails")}
        </Link>
        <Button
          type="button"
          variant="ghost"
          onClick={() => onCancel(booking)}
          className="h-11 flex-1 rounded-[10px] border border-[#F3CFCF] bg-card text-[14px] font-bold text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer"
        >
          {t("cancel")}
        </Button>
      </div>
    </article>
  );
}
