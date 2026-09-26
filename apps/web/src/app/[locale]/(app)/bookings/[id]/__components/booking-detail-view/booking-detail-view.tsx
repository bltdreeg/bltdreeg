"use client";

// تفاصيل الحجز — قبل يوم الميعاد (مطابق لتصميم FRAME 11A في web app design.html)
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, Copy, Check, Phone, ArrowLeft, CalendarSync, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ROUTE_ACCOUNT, ROUTE_BOOKINGS, ROUTE_BOOK_SLOT, ROUTE_BOOKING_RATE } from "@/lib/data/constants/routes.constants";
import { BookingStatus, type Booking } from "@/lib/types/booking";
import type { SalonDetails } from "@/lib/types/salon";
import type { Barber } from "@/lib/types/barber/barber.interface";
import type { Service } from "@/lib/types/service/service.interface";
import {
  calculateAppointmentWindow,
  formatBookingDetailDate,
  formatDayOfWeek,
  formatTime,
} from "@/lib/utils/format/date.utils";
import { formatDistance, formatPrice } from "@/lib/utils/format/price.utils";
import { CancelBookingDialog } from "../../../__components/cancel-booking-dialog";

interface BookingDetailViewProps {
  booking: Booking;
  salon?: SalonDetails | null;
  barber?: Barber | null;
  services?: Service[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0][0];
  return `${parts[0][0]} ${parts[1][0]}`;
}

export function BookingDetailView({
  booking,
  salon,
  barber,
  services = [],
}: BookingDetailViewProps) {
  const t = useTranslations("app.bookingDetail");
  const tDateTime = useTranslations("common.dateTime");
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(booking.status);

  const isCancelled = currentStatus === BookingStatus.CANCELLED;
  const bookingCode = booking.bookingCode || "8C2-406";
  const timeText = formatTime(booking.startAt, locale);
  const dateDetailText = formatBookingDetailDate(booking.startAt, locale);
  const dayOfWeek = formatDayOfWeek(booking.startAt, locale);
  const windowInfo = calculateAppointmentWindow(booking.startAt, booking.durationMinutes, locale);
  const windowText = tDateTime("appointmentWindow", {
    duration: booking.durationMinutes,
    start: windowInfo.start,
    end: windowInfo.end,
  });
  const totalQueueDay = Math.max(9, booking.queueNumber + 6);

  const salonAddress = salon?.address || "شارع 9، المعادي — قبل ميدان الحرية بمحل، جنب صيدلية العزبي.";
  const salonLandmark =
    salon?.landmark || "أقرب مترو: المعادي (5 دقايق مشي) · فيه جراج للعربية في الشارع الجنبي";
  const salonPhone = salon?.phone || "01012345678";
  const salonRating = salon?.rating ?? 4.8;
  const salonDistance = salon?.distanceKm ?? 1.2;
  const salonArea = salon?.areaName || "المعادي";

  const barberName = barber?.name || booking.barberName || "محمود عبد العال";
  const barberRating = barber?.rating ?? 4.7;
  const barberInitials = getInitials(barberName);

  // Link to reschedule slot picker pre-filled with existing selections
  const rescheduleParams = new URLSearchParams();
  if (booking.serviceIds && booking.serviceIds.length > 0) {
    booking.serviceIds.forEach((sId) => rescheduleParams.append("serviceId", sId));
  }
  if (booking.barberId) {
    rescheduleParams.set("barberId", booking.barberId);
  }
  const rescheduleUrl = `${ROUTE_BOOK_SLOT(booking.shopId)}?${rescheduleParams.toString()}`;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(salonAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col bg-white text-[#0E0F11]">
      {/* 1. شريط مسار التنقل (Breadcrumb) + كود الحجز — مطابق لـ FRAME 11A */}
      <nav
        aria-label={t("breadcrumb.bookingDetails")}
        className="flex h-[60px] w-full items-center justify-between border-b border-[#E5E7EB] bg-white px-4 sm:px-8 lg:px-16"
      >
        <div className="flex items-center gap-3 text-[13px]">
          <Link
            href={ROUTE_ACCOUNT}
            className="font-semibold text-[#6B7280] transition-colors hover:text-[#0E0F11]"
          >
            {t("breadcrumb.account")}
          </Link>
          <ChevronLeft className="size-3.5 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          <Link
            href={ROUTE_BOOKINGS}
            className="font-semibold text-[#6B7280] transition-colors hover:text-[#0E0F11]"
          >
            {t("breadcrumb.bookings")}
          </Link>
          <ChevronLeft className="size-3.5 text-[#CFD4DA] rtl:rotate-0 ltr:rotate-180" />
          <span className="font-bold text-[#0E0F11]">{t("breadcrumb.bookingDetails")}</span>
        </div>
        <div className="text-[12.5px] tabular-nums text-[#6B7280]">
          {t("bookingCode", { code: bookingCode })}
        </div>
      </nav>

      {/* 2. المحتوى الرئيسي: عمودين على الشاشات الكبيرة — مطابق لـ FRAME 11A */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 pb-24 sm:px-8 sm:pb-8 lg:px-16 lg:pb-16 lg:pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
          {/* العمود الجانبي (في RTL على اليمين بالترتيب المنطقي أو يمين المحتوى في الشاشات العريضة) */}
          <aside className="w-full shrink-0 lg:w-[380px] lg:sticky lg:top-5 flex flex-col gap-3">
            {/* كارت معلومات الصالون */}
            <div className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white">
              {/* رأس الكارت */}
              <div className="flex items-center gap-3 border-b border-[#E5E7EB] p-4 sm:px-[18px] sm:py-4">
                <div className="relative size-[46px] shrink-0 overflow-hidden rounded-[10px] bg-gradient-to-br from-[#F7F8FA] to-[#EDEFF2] border border-[#E5E7EB]">
                  {salon?.coverImage ? (
                    <Image
                      src={salon.coverImage}
                      alt={booking.shopName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className="size-full"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(135deg,#F7F8FA 0 8px,#EDEFF2 8px 16px)",
                      }}
                    />
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <h2 className="text-[14.5px] font-bold leading-[1.3] text-[#0E0F11]">
                    {booking.shopName}
                  </h2>
                  <div className="text-[12.5px] leading-none text-[#6B7280] tabular-nums">
                    {salonArea} · {formatDistance(salonDistance, locale)} · {salonRating}
                  </div>
                </div>
              </div>

              {/* تفاصيل العنوان والتواصل */}
              <div className="flex flex-col gap-[11px] p-4 sm:px-[18px] sm:py-4">
                <p className="text-[13.5px] leading-[1.8] text-[#0E0F11]">{salonAddress}</p>
                <p className="text-[12.5px] leading-[1.7] text-[#6B7280]">{salonLandmark}</p>
                <div className="mt-0.5 flex gap-2">
                  <a
                    href={`tel:${salonPhone}`}
                    className="flex h-[42px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white text-[13.5px] font-bold text-[#0E0F11] transition-colors hover:bg-[#F7F8FA]"
                  >
                    <Phone className="size-3.5 text-[#6B7280]" />
                    <span>{t("callSalon")}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="flex h-[42px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white text-[13.5px] font-bold text-[#0E0F11] transition-colors hover:bg-[#F7F8FA] cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-[#15803D]" />
                        <span className="text-[#15803D]">{t("copied")}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-[#6B7280]" />
                        <span>{t("copyAddress")}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* كارت تعديل الحجز */}
            <div className="flex flex-col gap-2.5 rounded-[14px] border border-[#E5E7EB] bg-white p-4 sm:px-[18px] sm:py-4">
              <h3 className="text-sm font-bold leading-none text-[#0E0F11]">{t("rescheduleTitle")}</h3>
              <Link
                href={rescheduleUrl}
                className="flex h-11 w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white text-sm font-bold text-[#0E0F11] transition-colors hover:bg-[#F7F8FA]"
              >
                <CalendarSync className="size-4 text-[#6B7280]" />
                <span>{t("rescheduleTime")}</span>
              </Link>
              {!isCancelled ? (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="flex h-11 w-full items-center justify-center whitespace-nowrap rounded-[10px] border border-[#FECACA] bg-white text-sm font-bold text-[#EF4444] transition-colors hover:bg-red-50 cursor-pointer"
                >
                  {t("cancelBooking")}
                </button>
              ) : (
                <div className="flex h-11 w-full items-center justify-center rounded-[10px] bg-slate-100 text-sm font-bold text-[#6B7280]">
                  {t("bookingCancelled")}
                </div>
              )}
              <p className="text-center text-xs leading-[1.7] text-[#6B7280]">
                {t("freeCancellationHint")}
              </p>
            </div>
          </aside>

          {/* العمود الرئيسي (يسار العرض في LTR / يمين العرض في RTL) */}
          <div className="flex min-w-0 flex-1 flex-col gap-5">
            {/* عنوان الحجز وشارة الحالة */}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-[28px] font-extrabold leading-[1.25] text-[#0E0F11]">
                {t("yourBookingAt", { salon: booking.shopName })}
              </h1>
              {isCancelled ? (
                <span className="flex h-7 items-center whitespace-nowrap rounded-lg border border-red-200 bg-red-50 px-3 text-[12.5px] font-bold text-red-600">
                  {t("status.cancelled")}
                </span>
              ) : currentStatus === BookingStatus.DONE ? (
                <span className="flex h-7 items-center whitespace-nowrap rounded-lg border border-slate-200 bg-slate-100 px-3 text-[12.5px] font-bold text-[#6B7280]">
                  {t("status.completed")}
                </span>
              ) : (
                <span className="flex h-7 items-center whitespace-nowrap rounded-lg border border-[#CFE6E3] bg-[#F0FAF8] px-3 text-[12.5px] font-bold text-[#0B5A54]">
                  {t("status.confirmed")}
                </span>
              )}
            </div>

            {/* لافتة دعوة التقييم إذا كانت الزيارة منتهية ولم يتم التقييم */}
            {currentStatus === BookingStatus.DONE && typeof booking.rating !== "number" && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-[#FDF1DE] p-4 border border-[#FDE68A]">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <Star className="size-5 fill-[#B45309] text-[#B45309]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-[#B45309]">{t("rateVisitTitle")}</span>
                    <span className="text-xs text-[#92400E]">{t("rateVisitSubtitle")}</span>
                  </div>
                </div>
                <Link
                  href={ROUTE_BOOKING_RATE(booking.id)}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-[#B45309] px-4 text-xs font-bold text-white hover:bg-[#92400E] transition-colors self-start sm:self-auto cursor-pointer"
                >
                  {t("rateNow")}
                </Link>
              </div>
            )}
            {typeof booking.rating === "number" && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50/80 px-4 py-2.5 border border-amber-200/80 w-fit">
                <Star className="size-4 fill-[#B45309] text-[#B45309]" />
                <span className="text-xs font-bold text-[#B45309]">
                  {t("yourRatingStars", { rating: booking.rating })}
                </span>
              </div>
            )}

            {/* كارت التذكرة — مطابق تماماً لتصميم FRAME 11A */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              {/* الخط العلوي الأخضر */}
              <div className="h-1 w-full bg-[#0F766E]" />

              {/* قسم التذكرة المقسم عمودياً */}
              <div className="flex flex-col sm:flex-row sm:items-stretch">
                {/* ميعادك */}
                <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
                  <span className="text-[12.5px] font-semibold tracking-wide text-[#6B7280]">
                    {t("ticket.yourTime")}
                  </span>
                  <span className="text-[36px] sm:text-[40px] font-extrabold leading-none tabular-nums text-[#0E0F11]">
                    {timeText}
                  </span>
                  <span className="text-[13.5px] leading-none text-[#6B7280]">
                    {dateDetailText}
                  </span>
                </div>

                {/* الخط المنقط الفاصل */}
                <div className="hidden sm:block w-px my-5 bg-[repeating-linear-gradient(#D9DDE2_0_5px,transparent_5px_10px)] shrink-0" />
                <div className="block sm:hidden h-px mx-5 bg-[repeating-linear-gradient(to_right,#D9DDE2_0_5px,transparent_5px_10px)]" />

                {/* رقمك في الدور */}
                <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
                  <span className="text-[12.5px] font-semibold tracking-wide text-[#6B7280]">
                    {t("ticket.yourQueueNumber")}
                  </span>
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-[70px] shrink-0 items-center justify-center rounded-[14px] border-2 border-[#0F766E] bg-[#F0FAF8]">
                      <span className="text-[40px] font-extrabold leading-none tabular-nums text-[#0B5A54]">
                        {booking.queueNumber}
                      </span>
                    </div>
                    <div className="text-[13px] leading-[1.6] text-[#6B7280]">
                      {t("ticket.outOfTotal", { total: totalQueueDay, day: dayOfWeek })}
                      <br />
                      {t("ticket.liveOnDay")}
                    </div>
                  </div>
                </div>
              </div>

              {/* الشريط السفلي التوضيحي داخل التذكرة */}
              <div className="border-t border-[#E5E7EB] bg-[#F7F8FA] px-5 py-3.5 sm:px-6">
                <p className="text-[13px] leading-[1.7] text-[#6B7280]">
                  {t("ticket.dayExplanation")}
                </p>
              </div>
            </div>

            {/* جدول تفاصيل الحجز (الخدمات والحلاق والمدة والإجمالي) */}
            <div className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white">
              <div className="border-b border-[#E5E7EB] bg-[#F7F8FA] px-5 py-3.5 sm:px-5">
                <h2 className="text-[15px] font-bold leading-none text-[#0E0F11]">{t("table.title")}</h2>
              </div>

              {/* صف الخدمات */}
              <div className="flex flex-col gap-1 border-b border-[#F1F3F5] p-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4 sm:px-5">
                <span className="w-full shrink-0 text-[13px] font-semibold text-[#6B7280] sm:w-[120px]">
                  {t("table.services")}
                </span>
                <div className="flex-1 text-[14.5px] font-semibold leading-[1.8] text-[#0E0F11]">
                  {services && services.length > 0 ? (
                    services.map((svc, i) => (
                      <div key={svc.id}>
                        {svc.name} — {t("table.minutes", { count: svc.durationMinutes })} — {formatPrice(svc.price, locale)}
                      </div>
                    ))
                  ) : booking.serviceNames && booking.serviceNames.length > 0 ? (
                    <div>{booking.serviceNames.join(" + ")}</div>
                  ) : (
                    <div>قص شعر بالمقص — 30 دقيقة — 120 ج.م<br />تحديد دقن — 20 دقيقة — 60 ج.م</div>
                  )}
                </div>
              </div>

              {/* صف الحلاق */}
              <div className="flex flex-col gap-1.5 border-b border-[#F1F3F5] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
                <span className="w-full shrink-0 text-[13px] font-semibold text-[#6B7280] sm:w-[120px]">
                  {t("table.barber")}
                </span>
                <div className="flex flex-1 items-center gap-[11px]">
                  <div className="flex size-[34px] shrink-0 items-center justify-center rounded-full border border-[#CFE6E3] bg-[#F0FAF8] text-xs font-bold text-[#0B5A54]">
                    {barberInitials}
                  </div>
                  <span className="text-[14.5px] font-semibold text-[#0E0F11] tabular-nums">
                    {barberName} · {barberRating}
                  </span>
                </div>
              </div>

              {/* صف المدة الكلية */}
              <div className="flex flex-col gap-1 border-b border-[#F1F3F5] p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
                <span className="w-full shrink-0 text-[13px] font-semibold text-[#6B7280] sm:w-[120px]">
                  {t("table.totalDuration")}
                </span>
                <span className="flex-1 text-[14.5px] font-semibold tabular-nums text-[#0E0F11]">
                  {windowText}
                </span>
              </div>

              {/* صف الإجمالي */}
              <div className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5">
                <span className="w-full shrink-0 text-[13px] font-semibold text-[#6B7280] sm:w-[120px]">
                  {t("table.totalPrice")}
                </span>
                <div className="flex flex-1 flex-wrap items-baseline gap-2.5">
                  <span className="text-[22px] font-extrabold leading-none tabular-nums text-[#0E0F11]">
                    {formatPrice(booking.totalPrice, locale)}
                  </span>
                  <span className="text-[13px] text-[#6B7280]">{t("table.payAtSalon")}</span>
                </div>
              </div>
            </div>

            {/* كارت سياسة الإلغاء */}
            <div className="flex flex-col gap-3 rounded-[14px] border border-[#E5E7EB] bg-[#F7F8FA] p-5">
              <h3 className="text-[15px] font-bold leading-none text-[#0E0F11]">{t("policy.title")}</h3>
              <div className="flex flex-col gap-[9px]">
                <div className="flex items-start gap-2.5">
                  <div className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#16A34A]" />
                  <span className="text-[13.5px] leading-[1.8] text-[#0E0F11]">
                    {t("policy.free", { time: timeText })}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#F59E0B]" />
                  <span className="text-[13.5px] leading-[1.8] text-[#0E0F11]">
                    {t("policy.late")}
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="mt-[7px] size-1.5 shrink-0 rounded-full bg-[#EF4444]" />
                  <span className="text-[13.5px] leading-[1.8] text-[#0E0F11]">
                    {t("policy.noShow")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* حوار إلغاء الحجز (FRAME 10D1) */}
      <CancelBookingDialog
        bookingId={booking.id}
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        onCancelled={() => {
          setCurrentStatus(BookingStatus.CANCELLED);
        }}
      />
    </div>
  );
}
