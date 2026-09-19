"use client";

// متابعة الدور الحية — يوم الميعاد (مطابق لتصميم FRAME 11B في web app design.html)
import { useState } from "react";
import Image from "next/image";
import {
  Bell,
  Check,
  ChevronLeft,
  Copy,
  Navigation,
  Phone,
  CalendarSync,
  AlertTriangle,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOKINGS, ROUTE_BOOK_SLOT } from "@/lib/data/constants/routes.constants";
import { BookingStatus, type Booking } from "@/lib/types/booking";
import type { SalonDetails } from "@/lib/types/salon";
import type { Barber } from "@/lib/types/barber/barber.interface";
import type { Service } from "@/lib/types/service/service.interface";
import { Punctuality, type QueueStatus } from "@/lib/types/queue";
import {
  calculateAppointmentWindow,
  calculateDepartureTime,
  calculateRemainingMinutes,
  formatDate,
  formatTime,
} from "@/lib/utils/format/date.utils";
import { CancelBookingDialog } from "../../../__components/cancel-booking-dialog";

interface LiveTrackingViewProps {
  booking: Booking;
  salon?: SalonDetails | null;
  barber?: Barber | null;
  services?: Service[];
  queueStatus: QueueStatus;
}

export function LiveTrackingView({
  booking,
  salon,
  barber,
  services = [],
  queueStatus,
}: LiveTrackingViewProps) {
  const [copied, setCopied] = useState(false);
  const [remindSet, setRemindSet] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<BookingStatus>(booking.status);

  const isCancelled = currentStatus === BookingStatus.CANCELLED;
  const isRunningLate = queueStatus.punctuality === Punctuality.RUNNING_LATE || queueStatus.delayMinutes >= 10;
  const delayMinutes = queueStatus.delayMinutes || (isRunningLate ? 10 : 0);

  const barberName = barber?.name || booking.barberName || "كريم مصطفى";
  const duration = booking.durationMinutes || 50;

  const timeText = formatTime(booking.startAt);
  const expectedStartIso = queueStatus.estimatedStartAt || booking.startAt;
  const expectedTimeText = formatTime(expectedStartIso);
  const remainingMinutes = Math.max(0, calculateRemainingMinutes(expectedStartIso));
  const departureTime = calculateDepartureTime(expectedStartIso, 20);

  const salonAddress =
    salon?.address || "14 شارع 231، المعادي الجديدة — فوق فرع بنك مصر، الدور الأول.";
  const salonPhone = salon?.phone || "01012345678";
  const peopleAhead = queueStatus.peopleAhead;
  const totalQueueToday = Math.max(8, booking.queueNumber + 5);

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

  // 8 segments for queue visualizer
  // e.g. completed = booking.queueNumber - peopleAhead - 1
  const completedSegments = Math.max(0, booking.queueNumber - peopleAhead - 1);
  const activeSegmentIndex = completedSegments; // currently in chair
  const totalSegments = 8;

  return (
    <div dir="rtl" className="flex min-h-full flex-1 flex-col bg-white text-[#0E0F11]">
      {/* 1. الشريط العلوي الأخضر الكامل — مطابق لـ FRAME 11B */}
      <header className="min-h-[54px] w-full bg-[#0F766E] px-4 py-2 sm:px-8 sm:py-[9px] lg:px-16">
        <div className="mx-auto flex flex-wrap items-center justify-between gap-3 sm:gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link
              href={ROUTE_BOOKINGS}
              className="text-[17px] font-black leading-none text-white hover:opacity-95"
            >
              بالتدريج
            </Link>
            <div className="hidden h-[26px] w-px bg-white/25 sm:block" />
            <div className="flex items-baseline gap-1.5 sm:gap-[7px]">
              <span className="text-xs font-medium leading-none text-white/90">ميعادك النهارده</span>
              <span className="text-[17px] font-extrabold leading-none tabular-nums text-white">
                {timeText}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-[7px]">
              <span className="text-xs font-medium leading-none text-white/90">رقمك في الدور</span>
              <span className="text-[17px] font-extrabold leading-none tabular-nums text-white">
                {booking.queueNumber}
              </span>
            </div>
          </div>

          {/* شارة التزام الصالون */}
          {isRunningLate ? (
            <div className="flex shrink-0 items-center gap-[7px] rounded-lg bg-[#FEF3C7] px-2.5 py-1.5">
              <div className="size-1.5 rounded-full bg-[#B45309]" />
              <span className="text-xs font-bold leading-none text-[#92400E]">
                الصالون متأخر ~{delayMinutes} دقايق
              </span>
            </div>
          ) : (
            <div className="flex shrink-0 items-center gap-[7px] rounded-lg bg-[#DCFCE7] px-2.5 py-1.5">
              <div className="size-1.5 rounded-full bg-[#15803D]" />
              <span className="text-xs font-bold leading-none text-[#15803D]">
                الصالون في ميعاده
              </span>
            </div>
          )}
        </div>
      </header>

      {/* 2. المحتوى الرئيسي: عمودين على الشاشات الكبيرة — مطابق لـ FRAME 11B */}
      <main className="mx-auto max-w-[1440px] px-4 py-8 pb-24 sm:px-8 sm:pb-8 lg:px-16 lg:pb-16 lg:pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-6">
          {/* العمود الجانبي (380px) */}
          <aside className="w-full shrink-0 lg:w-[380px] lg:sticky lg:top-5 flex flex-col gap-3">
            {/* كارت الصالون والحلاق */}
            <div className="overflow-hidden rounded-[14px] border border-[#E5E7EB] bg-white">
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
                  <div className="text-[12.5px] leading-none text-[#6B7280]">
                    مع {barberName} · {duration} دقيقة
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-[11px] p-4 sm:px-[18px] sm:py-4">
                <p className="text-[13.5px] leading-[1.8] text-[#0E0F11]">{salonAddress}</p>
                <div className="flex gap-2">
                  <a
                    href={`tel:${salonPhone}`}
                    className="flex h-[42px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white text-[13.5px] font-bold text-[#0E0F11] transition-colors hover:bg-[#F7F8FA]"
                  >
                    <Phone className="size-3.5 text-[#6B7280]" />
                    <span>اتصل بالصالون</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="flex h-[42px] flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white text-[13.5px] font-bold text-[#0E0F11] transition-colors hover:bg-[#F7F8FA] cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-[#15803D]" />
                        <span className="text-[#15803D]">اتنسخ!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5 text-[#6B7280]" />
                        <span>انسخ العنوان</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* كارت "هنبعتلك تنبيه" */}
            <div className="flex flex-col gap-[11px] rounded-[14px] border border-[#E5E7EB] bg-white p-4 sm:px-[18px] sm:py-4">
              <h3 className="text-sm font-bold leading-none text-[#0E0F11]">هنبعتلك تنبيه</h3>
              <div className="flex items-start gap-2.5">
                <div className="mt-[7px] size-[7px] shrink-0 rounded-full bg-[#0F766E]" />
                <span className="text-[13px] leading-[1.8] text-[#0E0F11]">لما يفضل قدامك اتنين.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="mt-[7px] size-[7px] shrink-0 rounded-full bg-[#0F766E]" />
                <span className="text-[13px] leading-[1.8] text-[#0E0F11]">وبعدين لما يجي دورك.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="mt-[7px] size-[7px] shrink-0 rounded-full bg-[#F59E0B]" />
                <span className="text-[13px] leading-[1.8] text-[#0E0F11]">
                  ولو الصالون اتأخر، هنقولك الميعاد الجديد.
                </span>
              </div>
              <p className="text-xs leading-[1.7] text-[#6B7280]">على واتساب والتطبيق</p>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex flex-col gap-2 rounded-[14px] border border-[#E5E7EB] bg-white p-3.5 sm:px-[18px] sm:py-3.5">
              <Link
                href={rescheduleUrl}
                className="flex h-[42px] w-full items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white text-[13.5px] font-bold text-[#0E0F11] transition-colors hover:bg-[#F7F8FA]"
              >
                <CalendarSync className="size-4 text-[#6B7280]" />
                <span>عدّل الميعاد</span>
              </Link>
              {!isCancelled ? (
                <button
                  type="button"
                  onClick={() => setCancelModalOpen(true)}
                  className="flex h-[42px] w-full items-center justify-center whitespace-nowrap rounded-[10px] border border-[#FECACA] bg-white text-[13.5px] font-bold text-[#EF4444] transition-colors hover:bg-red-50 cursor-pointer"
                >
                  إلغاء الحجز
                </button>
              ) : (
                <div className="flex h-[42px] w-full items-center justify-center rounded-[10px] bg-slate-100 text-[13.5px] font-bold text-[#6B7280]">
                  تم إلغاء هذا الحجز
                </div>
              )}
            </div>
          </aside>

          {/* العمود الرئيسي (متابعة الدور الحية) */}
          <div className="flex min-w-0 flex-1 flex-col gap-[18px]">
            {/* كارت التذكرة الحية — برواز 2px تيل و زوايا 18px */}
            <div className="overflow-hidden rounded-[18px] border-2 border-[#0F766E] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
              {/* شريط حالة اليوم والتحديث */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0F766E] px-5 py-3.5 sm:px-[26px]">
                <span className="text-sm sm:text-base font-extrabold leading-none text-white">
                  النهارده {formatDate(booking.startAt).replace("،", "")} · الدور شغال
                </span>
                <span className="text-[12.5px] font-medium leading-none text-white/90 tabular-nums">
                  آخر تحديث {formatTime(new Date().toISOString())}
                </span>
              </div>

              {/* قسم الميعاد ورقم الدور */}
              <div className="flex flex-col sm:flex-row sm:items-stretch">
                {/* ميعادك */}
                <div className="flex flex-1 flex-col gap-2.5 p-6 sm:p-7">
                  <span className="text-[13px] font-semibold tracking-wide text-[#6B7280]">
                    ميعادك
                  </span>
                  <span className="text-[48px] sm:text-[58px] font-extrabold leading-none tabular-nums text-[#0E0F11]">
                    {timeText}
                  </span>
                  <span className="text-[13.5px] leading-none text-[#6B7280]">
                    مع {barberName} · {duration} دقيقة
                  </span>
                </div>

                {/* الخط المنقط الفاصل */}
                <div className="hidden sm:block w-px my-6 bg-[repeating-linear-gradient(#D9DDE2_0_5px,transparent_5px_10px)] shrink-0" />
                <div className="block sm:hidden h-px mx-6 bg-[repeating-linear-gradient(to_right,#D9DDE2_0_5px,transparent_5px_10px)]" />

                {/* رقمك في الدور */}
                <div className="flex flex-1 flex-col gap-2.5 p-6 sm:p-7">
                  <span className="text-[13px] font-semibold tracking-wide text-[#6B7280]">
                    رقمك في الدور
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="flex size-20 sm:size-24 shrink-0 items-center justify-center rounded-[18px] border-[3px] border-[#0F766E] bg-[#F0FAF8]">
                      <span className="text-[48px] sm:text-[58px] font-extrabold leading-none tabular-nums text-[#0B5A54]">
                        {booking.queueNumber}
                      </span>
                    </div>
                    <div className="text-[13.5px] leading-[1.6] text-[#6B7280]">
                      من {totalQueueToday} في دور
                      <br />
                      النهارده
                    </div>
                  </div>
                </div>
              </div>

              {/* قسم الدور الحي والعداد وشريط التقدم */}
              <div className="flex flex-col gap-3.5 border-t border-[#E5E7EB] p-5 sm:p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-[34px] font-extrabold leading-none tabular-nums text-[#0F766E]">
                      {peopleAhead}
                    </span>
                    <span className="text-[17px] font-bold text-[#0E0F11]">قدامك في الدور</span>
                  </div>

                  {isRunningLate ? (
                    <div className="flex items-center gap-2 rounded-[10px] border border-[#FDE68A] bg-[#FEF3C7] px-3.5 py-2">
                      <div className="size-2 rounded-full bg-[#B45309]" />
                      <span className="text-[14.5px] font-bold leading-none text-[#92400E]">
                        الصالون متأخر ~{delayMinutes} دقايق
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 rounded-[10px] border border-[#BBF7D0] bg-[#DCFCE7] px-3.5 py-2">
                      <div className="size-2 rounded-full bg-[#15803D]" />
                      <span className="text-[14.5px] font-bold leading-none text-[#15803D]">
                        الصالون ماشي في ميعاده
                      </span>
                    </div>
                  )}
                </div>

                {/* شريط التقدم المجزأ — 8 مستطيلات */}
                <div className="flex gap-1.5 pt-1">
                  {Array.from({ length: totalSegments }).map((_, idx) => {
                    const isDone = idx < completedSegments;
                    const isCurrent = idx === activeSegmentIndex;
                    return (
                      <div
                        key={idx}
                        className={`h-[9px] flex-1 rounded-[5px] transition-colors ${
                          isDone
                            ? "bg-[#0F766E]"
                            : isCurrent
                              ? "bg-[#A7DED8] animate-pulse"
                              : "bg-[#E5E7EB]"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* أوقات التقدير */}
                <div className="flex flex-wrap items-center gap-2.5 text-[13.5px] leading-[1.7] text-[#6B7280]">
                  <span>
                    دورك تقريبًا {expectedTimeText} · متبقي {remainingMinutes} دقيقة
                  </span>
                  <span className="size-1 rounded-full bg-[#CFD4DA]" />
                  <span>متوسط تأخير الصالون النهارده 4 دقايق</span>
                </div>

                {/* صندوق التنبيه في حالة التأخير */}
                {isRunningLate ? (
                  <div className="flex flex-wrap items-center gap-2.5 rounded-[11px] border border-dashed border-[#FDE68A] bg-[#FEF3C7]/40 p-3 sm:px-3.5 sm:py-3">
                    <div className="flex shrink-0 items-center gap-2 rounded-[9px] border border-[#FDE68A] bg-[#FEF3C7] px-2.5 py-1.5">
                      <div className="size-1.5 rounded-full bg-[#B45309]" />
                      <span className="text-[13px] font-bold text-[#92400E]">
                        الصالون متأخر ~{delayMinutes} دقايق
                      </span>
                    </div>
                    <span className="text-[12.5px] leading-[1.6] text-[#6B7280]">
                      ميعادك المتوقع اتعدّل تلقائياً لـ {expectedTimeText} عشان متستناش على الفاضي.
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2.5 rounded-[11px] border border-dashed border-[#E5E7EB] bg-[#F7F8FA] p-3 sm:px-3.5 sm:py-3">
                    <div className="flex shrink-0 items-center gap-2 rounded-[9px] border border-[#BBF7D0] bg-[#DCFCE7] px-2.5 py-1.5">
                      <div className="size-1.5 rounded-full bg-[#15803D]" />
                      <span className="text-[13px] font-bold text-[#15803D]">الدور منتظم</span>
                    </div>
                    <span className="text-[12.5px] leading-[1.6] text-[#6B7280]">
                      لو حصل أي تأخير أو زبون خلص بدري، الصفحة هتحدّث الوقت فوراً.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* كارت نصيحة التحرك — "تقدر تتحرك الساعة 6:10" */}
            <div className="flex flex-col gap-4 rounded-[14px] border border-[#E5E7EB] bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-[22px]">
              <div className="flex items-center gap-4">
                <div className="flex size-[52px] shrink-0 items-center justify-center rounded-[13px] border border-[#CFE6E3] bg-[#F0FAF8]">
                  <Navigation className="size-5 text-[#0F766E]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg sm:text-[19px] font-extrabold leading-[1.3] text-[#0E0F11]">
                    تقدر تتحرك الساعة {departureTime}
                  </h3>
                  <p className="text-[13px] leading-[1.6] text-[#6B7280]">
                    1.2 كم من مكانك · حوالي 12 دقيقة بالعربية و 18 مشي
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRemindSet(!remindSet)}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[10px] border border-[#E5E7EB] bg-white px-4 text-[13.5px] font-bold text-[#0E0F11] transition-colors hover:bg-slate-50 cursor-pointer"
              >
                {remindSet ? (
                  <>
                    <Check className="size-4 text-[#15803D]" />
                    <span className="text-[#15803D]">هنفكرك قبلها بـ 10 دقايق</span>
                  </>
                ) : (
                  <>
                    <Bell className="size-4 text-[#6B7280]" />
                    <span>فكّرني قبلها بـ 10 دقايق</span>
                  </>
                )}
              </button>
            </div>

            {/* مخطط خطوات الدور — "الدور ماشي إزاي" */}
            <div className="flex flex-col gap-[18px] rounded-[14px] border border-[#E5E7EB] bg-white p-5 sm:p-[22px]">
              <h3 className="text-base font-bold leading-none text-[#0E0F11]">الدور ماشي إزاي</h3>

              {/* الشريحة الأفقية للخطوات */}
              <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-0 overflow-x-auto pb-1">
                {/* 1. الحجز مؤكد */}
                <div className="flex flex-1 flex-col gap-2.5">
                  <div className="flex items-center gap-0">
                    <div className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <div className="h-0.5 flex-1 bg-[#0F766E]" />
                  </div>
                  <div className="flex flex-col gap-1 pr-1">
                    <span className="text-[13.5px] font-semibold leading-none text-[#0E0F11]">
                      الحجز مؤكد
                    </span>
                    <span className="text-xs leading-none text-[#6B7280] tabular-nums">امبارح 9:12 م</span>
                  </div>
                </div>

                {/* 2. قرب ميعادك */}
                <div className="flex flex-1 flex-col gap-2.5">
                  <div className="flex items-center gap-0">
                    <div className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#0F766E] text-white">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <div className="h-0.5 flex-1 bg-[#0F766E]" />
                  </div>
                  <div className="flex flex-col gap-1 pr-1">
                    <span className="text-[13.5px] font-semibold leading-none text-[#0E0F11]">
                      قرب ميعادك
                    </span>
                    <span className="text-xs leading-none text-[#6B7280] tabular-nums">النهارده 5:30 م</span>
                  </div>
                </div>

                {/* 3. قدامك واحد كمان (الخطوة الحالية) */}
                <div className="flex flex-1 flex-col gap-2.5">
                  <div className="flex items-center gap-0">
                    <div className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-[#0F766E] shadow-[0_0_0_5px_#F0FAF8]">
                      <div className="size-2 rounded-full bg-white animate-pulse" />
                    </div>
                    <div className="h-0.5 flex-1 bg-[#E5E7EB]" />
                  </div>
                  <div className="flex flex-col gap-1.5 pr-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-extrabold leading-none text-[#0B5A54]">
                        قدامك واحد كمان
                      </span>
                      <span className="rounded-md bg-[#0F766E] px-1.5 py-0.5 text-[10.5px] font-bold text-white leading-none">
                        دلوقتي
                      </span>
                    </div>
                    <span className="text-xs leading-relaxed text-[#6B7280]">
                      قدامك {peopleAhead} · بنستنى اللي قبلك يخلّص
                    </span>
                  </div>
                </div>

                {/* 4. دورك دلوقتي */}
                <div className="flex flex-1 flex-col gap-2.5">
                  <div className="flex items-center gap-0">
                    <div className="size-[26px] shrink-0 rounded-full border-2 border-[#E5E7EB] bg-white" />
                    <div className="h-0.5 flex-1 bg-[#E5E7EB]" />
                  </div>
                  <div className="flex flex-col gap-1 pr-1">
                    <span className="text-[13.5px] font-semibold leading-none text-[#A5ABB3]">
                      دورك دلوقتي
                    </span>
                    <span className="text-xs leading-none text-[#A5ABB3] tabular-nums">
                      متوقع {timeText}
                    </span>
                  </div>
                </div>

                {/* 5. تمت الخدمة */}
                <div className="flex shrink-0 flex-col gap-2.5">
                  <div className="size-[26px] rounded-full border-2 border-[#E5E7EB] bg-white" />
                  <div className="flex flex-col gap-1 pr-1">
                    <span className="text-[13.5px] font-semibold leading-none text-[#A5ABB3]">
                      تمت الخدمة
                    </span>
                    <span className="text-xs leading-none text-[#A5ABB3] tabular-nums">
                      متوقع 7:20 م
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[13px] leading-[1.8] text-[#6B7280]">
                هنبعتلك تنبيه لما يفضل قدامك اتنين، وبعدين لما يجي دورك، ولو الصالون اتأخر.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* حوار إلغاء الحجز */}
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

