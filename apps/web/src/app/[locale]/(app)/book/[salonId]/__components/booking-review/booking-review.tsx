"use client";

import { useTranslations } from "next-intl";
import { Store, User, Calendar, Clock, AlertCircle } from "lucide-react";
import type { SalonDetails } from "@/lib/types/salon";
import type { Service } from "@/lib/types/service/service.interface";
import type { Barber } from "@/lib/types/barber/barber.interface";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK_BARBER, ROUTE_BOOK_SLOT } from "@/lib/data/constants/routes.constants";
import { formatDayLabel, formatTime } from "@/lib/utils/format/date.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";

type BookingReviewProps = {
  salon: SalonDetails;
  services: Service[];
  barber: Barber | null;
  when: string;
  queryString: string;
  submit: (formData: FormData) => void;
};

export function BookingReview({ salon, services, barber, when, queryString, submit }: BookingReviewProps) {
  const t = useTranslations("app.book.review");
  const isNow = when === "now";
  const totalMinutes = services.reduce((n, s) => n + s.durationMinutes, 0);
  const totalPrice = services.reduce((n, s) => n + s.price, 0);

  return (
    <form action={submit} className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {/* 1 — معلومات الصالون — مطابق لفريم ٢٥ */}
      <div className="flex items-center gap-3.5 rounded-[14px] border border-border bg-card p-4">
        <div className="flex size-[54px] shrink-0 items-center justify-center rounded-[11px] bg-secondary text-primary">
          <Store className="size-6 text-primary" />
        </div>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="truncate text-[15px] font-bold text-foreground">{salon.name}</span>
          <span className="text-xs text-muted-foreground">{salon.address || salon.cityName}</span>
          <span className="text-xs text-muted-foreground">
            {salon.distanceKm} كم — {Math.round(salon.distanceKm * 5)} دقايق بالعربية
          </span>
        </div>
      </div>

      {/* 2 — الخدمات — مطابق لفريم ٢٥ */}
      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-bold text-muted-foreground">{t("services")}</span>
        <div className="flex flex-col divide-y divide-border rounded-[14px] border border-border bg-card px-4">
          {services.map((svc) => (
            <div key={svc.id} className="flex items-center justify-between py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14.5px] font-bold text-foreground">{svc.name}</span>
                <span className="tabular text-xs text-muted-foreground">
                  {t("minutes", { count: svc.durationMinutes })}
                </span>
              </div>
              <span className="tabular text-[14.5px] font-bold text-foreground">{formatPrice(svc.price)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3 — الحلاق — مطابق لفريم ٢٥ */}
      <div className="flex items-center justify-between rounded-[14px] border border-border bg-card p-3.5">
        <div className="flex items-center gap-2.5">
          <User className="size-4.5 text-muted-foreground" />
          <span className="text-[13.5px] font-semibold text-muted-foreground">{t("barber")}</span>
          <span className="text-[14px] font-bold text-foreground">{barber?.name ?? t("anyBarber")}</span>
        </div>
        <Link
          href={`${ROUTE_BOOK_BARBER(salon.id)}?${queryString}`}
          className="text-xs font-bold text-primary hover:underline"
        >
          {t("change")}
        </Link>
      </div>

      {/* 4 — المعاد (إذا لم يكن طابور فوري) */}
      {!isNow && (
        <div className="flex items-center justify-between rounded-[14px] border border-border bg-card p-3.5">
          <div className="flex items-center gap-2.5">
            <Calendar className="size-4.5 text-muted-foreground" />
            <span className="text-[13.5px] font-semibold text-muted-foreground">{t("time")}</span>
            <span className="text-[14px] font-bold text-foreground">
              {formatDayLabel(when)} · {formatTime(when)}
            </span>
          </div>
          <Link
            href={`${ROUTE_BOOK_SLOT(salon.id)}?${queryString}`}
            className="text-xs font-bold text-primary hover:underline"
          >
            {t("change")}
          </Link>
        </div>
      )}

      {/* 5 — كارت توقيت الدور / المعاد — مطابق لفريم ٢٥ */}
      {isNow ? (
        <div className="rounded-xl bg-accent p-3.5">
          <div className="flex items-center gap-2.5">
            <Clock className="size-4.5 text-primary-pressed shrink-0" />
            <div className="flex-1">
              <div className="text-[14.5px] font-extrabold text-primary-pressed">
                {salon.queue.peopleAhead === 0
                  ? t("enterImmediately")
                  : t("turnWithinRange", {
                      min: salon.queue.waitMinutes,
                      max: salon.queue.waitMinutes + 10,
                    })}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-primary-pressed/80">
                {salon.queue.peopleAhead === 0
                  ? t("nobodyAhead")
                  : t("onlyAhead", { count: salon.queue.peopleAhead })}{" "}
                · {t("serviceDuration", { minutes: totalMinutes })}
              </div>
            </div>
          </div>
          <div className="mt-2.5 border-t border-primary/15 pt-2.5 text-xs leading-relaxed text-primary-pressed/80">
            {t("timeEstimatedLive")}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-accent p-3.5">
          <div className="flex items-center gap-2.5">
            <Clock className="size-4.5 text-primary-pressed shrink-0" />
            <div className="flex-1">
              <div className="text-[14.5px] font-extrabold text-primary-pressed">
                {t("appointmentTime", {
                  day: formatDayLabel(when),
                  time: formatTime(when),
                })}
              </div>
              <div className="mt-0.5 text-xs font-semibold text-primary-pressed/80">
                {t("serviceDuration", { minutes: totalMinutes })}
              </div>
            </div>
          </div>
          <div className="mt-2.5 border-t border-primary/15 pt-2.5 text-xs leading-relaxed text-primary-pressed/80">
            {t("comeFiveMinEarly")}
          </div>
        </div>
      )}

      {/* 6 — تنبيه سياسة الـ ٥ دقائق — مطابق لفريم ٢٥ */}
      <div className="flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200/60 p-3.5">
        <AlertCircle className="size-4.5 shrink-0 mt-0.5 text-amber-700" />
        <p className="text-[13px] font-semibold leading-relaxed text-amber-900">
          {t("fiveMinRule")}
        </p>
      </div>

      {/* 7 — ملخص الحساب — مطابق لفريم ٢٥ */}
      <div className="flex flex-col gap-2 rounded-[14px] border border-border bg-card p-4">
        <div className="flex items-center justify-between text-[13.5px]">
          <span className="font-semibold text-muted-foreground">{t("subtotal")}</span>
          <span className="tabular font-bold text-foreground">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-2.5">
          <span className="text-[15px] font-extrabold text-foreground">{t("totalPrice")}</span>
          <span className="tabular text-xl font-extrabold text-foreground">{formatPrice(totalPrice)}</span>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">{t("payCashInBranch")}</p>
      </div>

      {/* 8 — شريط الإجراء: ثابت بالأسفل على الموبايل والتابلت، ومكانه الطبيعي على الويب (الديسكتوب) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-5 pt-3 pb-[max(1.375rem,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(14,15,17,0.07)] lg:static lg:z-auto lg:border-t-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-2 lg:max-w-none">
          <button
            type="submit"
            className="flex h-[52px] lg:h-13 w-full items-center justify-center rounded-[10px] bg-primary text-base lg:text-[16px] font-bold text-white shadow-sm lg:shadow-none transition-colors hover:bg-primary-pressed cursor-pointer"
          >
            {t("confirmAndJoinQueue")}
          </button>
          <span className="text-center text-xs text-muted-foreground">
            {t("agreeCancellationPolicy")}
          </span>
        </div>
      </div>
    </form>
  );
}
