"use client";

// دورك دلوقتي — الحالة المقلوبة (مطابق تماماً لتصميم FRAME 11C في web app design.html)
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, Phone, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getAppName } from "@/lib/data/constants/app.constants";
import { ROUTE_BOOKINGS } from "@/lib/data/constants/routes.constants";
import type { Booking } from "@/lib/types/booking";
import type { SalonDetails } from "@/lib/types/salon";
import type { Barber } from "@/lib/types/barber/barber.interface";
import { formatTime } from "@/lib/utils/format/date.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";

interface YourTurnStateProps {
  booking: Booking;
  salon?: SalonDetails | null;
  barber?: Barber | null;
  onBackToLive?: () => void;
}

export function YourTurnState({
  booking,
  salon,
  barber,
  onBackToLive,
}: YourTurnStateProps) {
  const t = useTranslations("app.liveTracking.yourTurnState");
  const locale = useLocale();
  const [inShopConfirmed, setInShopConfirmed] = useState(false);

  const barberName = barber?.name || booking.barberName || "كريم مصطفى";
  const shopName = booking.shopName || salon?.name || "بربر لاونج المعادي";
  const timeText = formatTime(booking.startAt);
  const currentTimeText = formatTime(new Date().toISOString());

  const servicesText =
    booking.serviceNames && booking.serviceNames.length > 0
      ? booking.serviceNames.join(" + ")
      : "قص شعر بالمقص + تحديد دقن";

  const salonPhone = salon?.phone || "01012345678";

  return (
    <section
      role="status"
      aria-live="assertive"
      className="min-h-screen w-full bg-[#0F766E] text-white flex flex-col justify-between font-sans selection:bg-white selection:text-[#0B5A54]"
    >
      {/* الشريط العلوي الغامق — مطابق لـ FRAME 11C */}
      <header className="h-[50px] w-full bg-[#0B5A54] px-4 sm:px-8 lg:px-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href={ROUTE_BOOKINGS}
            className="text-[17px] font-black text-white hover:opacity-90"
          >
            {getAppName(locale)}
          </Link>
          {onBackToLive && (
            <button
              type="button"
              onClick={onBackToLive}
              className="flex items-center gap-1 text-xs text-white/80 hover:text-white cursor-pointer"
            >
              <ArrowRight className="size-3.5 rtl:rotate-180" />
              <span>{t("backToLive")}</span>
            </button>
          )}
        </div>
        <div className="text-[12.5px] font-semibold text-white/90 tabular-nums">
          {shopName} · {currentTimeText}
        </div>
      </header>

      {/* المحتوى المركزي البارز */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="flex w-full max-w-[900px] flex-col items-center gap-6 text-center">
          {/* شارة التنبيه المضيئة */}
          <div className="flex items-center gap-2.5 rounded-[10px] bg-white/16 px-4 py-2 border border-white/20">
            <div className="size-2.5 rounded-full bg-white animate-ping" />
            <span className="text-sm font-bold text-white">{t("salonCalledYou")}</span>
          </div>

          {/* العنوان الضخم 86px */}
          <h1 className="text-5xl sm:text-7xl lg:text-[86px] font-black leading-[1.05] tracking-tight text-white drop-shadow-sm">
            {t("yourTurnNow")}
          </h1>

          {/* مربع رقم الدور والتوجيه */}
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-[22px] my-2">
            <div className="flex size-[130px] sm:size-[150px] shrink-0 items-center justify-center rounded-[26px] border-4 border-white bg-white/10 shadow-lg">
              <span className="text-7xl sm:text-[92px] font-extrabold leading-none tabular-nums text-white">
                {booking.queueNumber}
              </span>
            </div>

            <div className="flex flex-col gap-2.5 text-center sm:text-start max-w-[420px]">
              <h2 className="text-xl sm:text-[26px] font-extrabold leading-[1.3] text-white">
                {t("takeChairOf", { barberName })}
              </h2>
              <p className="text-sm sm:text-base leading-[1.7] text-white/90">
                {t("turnSummary", {
                  time: timeText,
                  services: servicesText,
                  price: formatPrice(booking.totalPrice),
                })}
              </p>
            </div>
          </div>

          {/* أزرار الاستجابة السريعة */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => setInShopConfirmed(true)}
              className={`flex h-[54px] items-center justify-center gap-2 rounded-xl px-7 text-base font-extrabold transition-all cursor-pointer ${
                inShopConfirmed
                  ? "bg-white text-[#15803D] shadow-md"
                  : "bg-white text-[#0B5A54] hover:bg-white/95 active:scale-98 shadow-md"
              }`}
            >
              {inShopConfirmed ? (
                <>
                  <Check className="size-5 stroke-[3] text-[#15803D]" />
                  <span>{t("inShopConfirmed")}</span>
                </>
              ) : (
                t("inShopButton")
              )}
            </button>

            <a
              href={`tel:${salonPhone}`}
              className="flex h-[54px] items-center justify-center gap-2 rounded-xl border-[1.5px] border-white/55 bg-transparent px-6 text-base font-bold text-white transition-colors hover:bg-white/10 cursor-pointer"
            >
              <Phone className="size-4" />
              <span>{t("callSalon")}</span>
            </a>
          </div>

          {/* شريط التحذير في الأسفل — مهلة الـ 5 دقائق */}
          <div className="flex items-center gap-2.5 rounded-[11px] bg-black/15 px-4 py-3 sm:px-4.5">
            <div className="size-2 rounded-full bg-[#FDE68A] shrink-0" />
            <span className="text-sm font-medium leading-[1.6] text-white">
              {t("fiveMinuteRule")}
            </span>
          </div>
        </div>
      </main>

      {/* تذييل خفيف لمراعاة شريط التنقل السفلي */}
      <div className="h-24 sm:h-6 w-full shrink-0" />
    </section>
  );
}
