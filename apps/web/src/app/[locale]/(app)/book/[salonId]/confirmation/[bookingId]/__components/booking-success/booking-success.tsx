"use client";

// صفحة تأكيد الحجز — مطابقة لتصميم FRAME 09 في web app design.html
import { useTranslations, useLocale } from "next-intl";
import { Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKING_DETAILS, ROUTE_HOME } from "@/lib/data/constants/routes.constants";
import type { Booking } from "@/lib/types/booking";
import { getAppName } from "@/lib/data/constants/app.constants";
import { formatDate, formatDayLabel, formatTime, isToday, isTomorrow } from "@/lib/utils/format/date.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { AddToCalendar } from "./add-to-calendar";

interface BookingSuccessProps {
  booking: Booking;
}

export function BookingSuccess({ booking }: BookingSuccessProps) {
  const t = useTranslations("app.book.confirmation");
  const locale = useLocale();
  const peopleAhead = Math.max(0, booking.queueNumber - 1);
  const totalQueueCount = Math.max(8, booking.queueNumber + 3);
  const timeText = formatTime(booking.startAt, locale);

  const dateText = isToday(booking.startAt)
    ? t("dateToday", { date: formatDate(booking.startAt, locale) })
    : isTomorrow(booking.startAt)
      ? t("dateTomorrow", { date: formatDate(booking.startAt, locale) })
      : formatDate(booking.startAt, locale);

  const servicesText =
    booking.serviceNames && booking.serviceNames.length > 0
      ? booking.serviceNames.join(" + ")
      : t("defaultServices");

  const bookingCode = booking.bookingCode || "4B7-219";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-background text-[#0E0F11]">
      {/* 1. الشريط العلوي الأخضر الكامل — مطابق لـ FRAME 09 */}
      <header className="min-h-[54px] w-full bg-[#0F766E] px-4 py-2 sm:px-8 sm:py-[9px] lg:px-16">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={ROUTE_HOME}
              className="text-[17px] font-black leading-none text-white hover:opacity-95"
            >
              {getAppName(locale)}
            </Link>
            <div className="hidden h-[26px] w-px bg-white/25 sm:block" />
            <div className="flex items-baseline gap-1.5 sm:gap-[7px]">
              <span className="text-xs font-medium leading-none text-white/90">
                {isToday(booking.startAt)
                  ? t("header.yourAppointmentToday")
                  : t("header.yourAppointmentDay", { day: formatDayLabel(booking.startAt, locale) })}
              </span>
              <span className="text-[17px] font-extrabold leading-none tabular-nums text-white">
                {timeText}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-[7px]">
              <span className="text-xs font-medium leading-none text-white/90">{t("header.queueNumber")}</span>
              <span className="text-[17px] font-extrabold leading-none tabular-nums text-white">
                {booking.queueNumber}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-[7px] rounded-lg bg-[#DCFCE7] px-2.5 py-1.5">
            <div className="size-1.5 rounded-full bg-[#15803D]" />
            <span className="text-xs font-bold leading-none text-[#15803D]">{t("header.onSchedule")}</span>
          </div>
        </div>
      </header>

      {/* 2. المحتوى الرئيسي المتوسّط — مطابق لـ FRAME 09 */}
      <section aria-label={t("bookingDetails")} className="flex justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-16 lg:pb-16 lg:pt-12">
        <div className="flex w-full max-w-[820px] flex-col items-center gap-[18px]">
          {/* شارة تم الحجز الخضراء */}
          <div className="flex items-center gap-[11px] rounded-[10px] border border-[#BBF7D0] bg-[#DCFCE7] px-4 py-[9px]">
            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#16A34A] text-white">
              <Check className="size-3 stroke-[3]" />
            </div>
            <span className="text-[14.5px] font-bold leading-none text-[#15803D]">
              {t("bookingConfirmedAt", { salon: booking.shopName })}
            </span>
          </div>

          {/* تذكرة الحجز (Ticket Card) */}
          <div className="w-full overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            {/* الشريط اللوني الأخضر أعلى الكارت */}
            <div className="h-[5px] w-full bg-[#0F766E]" />

            {/* صف اسم الصالون والخدمات والسعر */}
            <div className="flex items-start justify-between gap-4 px-4 pt-[22px] sm:px-6">
              <div className="flex flex-col gap-1.5">
                <h1 className="text-[19px] font-bold leading-[1.3] text-[#0E0F11]">
                  {booking.shopName}
                </h1>
                <p className="text-[13.5px] leading-[1.6] text-[#6B7280]">
                  {servicesText} · {t("withBarberMinutes", { barber: booking.barberName, minutes: booking.durationMinutes })}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="text-[12.5px] leading-none text-[#6B7280]">{t("payAtSalon")}</span>
                <span className="whitespace-nowrap text-xl font-extrabold leading-none tabular-nums text-[#0E0F11]">
                  {formatPrice(booking.totalPrice, locale)}
                </span>
              </div>
            </div>

            {/* خط التقطيع المنقط مع الفتحات الدائرية على الطرفين */}
            <div className="relative mt-[22px]">
              <div className="border-t border-dashed border-[#D9DDE2]" />
              <div
                aria-hidden="true"
                className="absolute -top-[9px] -end-[10px] size-[18px] rounded-full border border-[#E5E7EB] bg-white"
              />
              <div
                aria-hidden="true"
                className="absolute -top-[9px] -start-[10px] size-[18px] rounded-full border border-[#E5E7EB] bg-white"
              />
            </div>

            {/* قسم الأرقام الكبيرة: الميعاد ورقم الدور */}
            <div className="flex flex-col items-stretch sm:flex-row">
              {/* عمود الميعاد */}
              <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-6">
                <span className="text-[12.5px] font-semibold tracking-[0.04em] text-[#6B7280]">
                  {t("yourTime")}
                </span>
                <span className="text-[44px] font-extrabold leading-none tabular-nums text-[#0E0F11] sm:text-[52px]">
                  {timeText}
                </span>
                <span className="text-[13.5px] text-[#6B7280]">{dateText}</span>
              </div>

              {/* الفاصل الرأسي المنقط */}
              <div className="my-[22px] hidden w-px bg-[repeating-linear-gradient(#D9DDE2_0_5px,transparent_5px_10px)] sm:block" />
              <div className="mx-4 block h-px border-t border-dashed border-[#D9DDE2] sm:hidden sm:mx-6" />

              {/* عمود رقمك في الدور */}
              <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-6">
                <span className="text-[12.5px] font-semibold tracking-[0.04em] text-[#6B7280]">
                  {t("yourQueueNumber")}
                </span>
                <div className="flex items-center gap-4">
                  <div className="flex size-[86px] shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-[#0F766E] bg-[#F0FAF8]">
                    <span className="text-[52px] font-extrabold leading-none tabular-nums text-[#0B5A54]">
                      {booking.queueNumber}
                    </span>
                  </div>
                  <span className="text-[13.5px] leading-[1.6] text-[#6B7280]">
                    {t("outOfTodayQueue", { count: totalQueueCount })}
                  </span>
                </div>
              </div>
            </div>

            {/* شريط أسفل التذكرة */}
            <div className="flex flex-col items-start justify-between gap-2.5 border-t border-[#E5E7EB] bg-[#F7F8FA] px-4 py-4 sm:flex-row sm:items-center sm:px-6">
              <span className="text-[13px] font-medium leading-[1.6] text-[#0E0F11]">
                {t("aheadNowHint", { count: peopleAhead })}
              </span>
              <span className="whitespace-nowrap text-[12.5px] tabular-nums text-[#6B7280]">
                {t("bookingCode", { code: bookingCode })}
              </span>
            </div>
          </div>

          {/* 3. أزرار الإجراءات: أضف للتقويم + تفاصيل الحجز */}
          <div className="flex w-full flex-col gap-2.5 sm:flex-row">
            <AddToCalendar booking={booking} />
            <Link
              href={ROUTE_BOOKING_DETAILS(booking.id)}
              className="flex h-12 min-h-[48px] w-full sm:flex-1 items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-white font-bold text-[15px] text-[#0E0F11] transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {t("bookingDetails")}
            </Link>
          </div>

          {/* 4. بطاقة التنبيهات: هنبعتلك إيه؟ */}
          <div className="flex w-full flex-col gap-[13px] rounded-[14px] border border-[#E5E7EB] bg-white p-5 sm:px-[22px] sm:py-5">
            <h2 className="text-[15px] font-bold text-[#0E0F11]">{t("whatWeSend.title")}</h2>
            <div className="flex flex-col gap-[11px]">
              <div className="flex items-start gap-[11px]">
                <div className="mt-1.5 size-[7px] shrink-0 rounded-full bg-[#0F766E]" />
                <span className="text-[13.5px] leading-[1.8] text-[#0E0F11]">
                  {t("whatWeSend.morning")}
                </span>
              </div>
              <div className="flex items-start gap-[11px]">
                <div className="mt-1.5 size-[7px] shrink-0 rounded-full bg-[#0F766E]" />
                <span className="text-[13.5px] leading-[1.8] text-[#0E0F11]">
                  {t("whatWeSend.oneAhead")}
                </span>
              </div>
              <div className="flex items-start gap-[11px]">
                <div className="mt-1.5 size-[7px] shrink-0 rounded-full bg-[#F59E0B]" />
                <span className="text-[13.5px] leading-[1.8] text-[#0E0F11]">
                  {t("whatWeSend.delay")}
                </span>
              </div>
            </div>
            <p className="text-[12.5px] leading-[1.7] text-[#6B7280]">
              {t("whatWeSend.channels")}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
