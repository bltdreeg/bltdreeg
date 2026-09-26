"use client";
// قسم المواعيد: مواعيد العمل الأسبوعية + العنوان — فريم ٢٣
import { MapPin, Phone } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { SalonDetails } from "@/lib/types/salon";
import { isOpenNow } from "@/lib/utils/hours.utils";
import { CopyAddressButton } from "./copy-address-button";

type SalonHoursProps = {
  salon: SalonDetails;
};

function getDayName(dayIndex: number, fallback: string, locale: string) {
  try {
    const d = new Date(2026, 8, 20 + dayIndex);
    return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "ar-EG-u-nu-latn", { weekday: "long" }).format(d);
  } catch {
    return fallback;
  }
}

export function SalonHours({ salon }: SalonHoursProps) {
  const t = useTranslations("marketing.salon.hours");
  const locale = useLocale();
  const open = isOpenNow(salon.hours);
  const todayIndex = new Date().getDay();

  return (
    <section id="hours" className="scroll-mt-28 px-4 sm:px-8 lg:rounded-[14px] lg:border lg:border-border lg:bg-background lg:p-6 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">{t("title")}</h2>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
            open ? "bg-success-bg text-success-strong" : "bg-muted text-muted-foreground"
          }`}
        >
          {open ? t("openNow") : t("closedNow")}
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        {salon.hours.map((h, i) => {
          const isToday = i === todayIndex;
          const isClosed = !h.open || !h.close;

          return (
            <div
              key={h.day}
              className={`flex items-center justify-between p-3 px-4 text-xs ${
                isToday ? "bg-accent font-bold text-accent-foreground" : "text-muted-foreground"
              } ${i > 0 ? "border-t border-border" : ""}`}
            >
              <span className="flex items-center gap-1.5">
                <span>{getDayName(i, h.day, locale)}</span>
                {isToday && (
                  <span className="rounded-xl bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {t("today")}
                  </span>
                )}
              </span>

              {isClosed ? (
                <span className="font-semibold text-destructive">{t("dayOff")}</span>
              ) : (
                <span className="tabular font-medium">
                  {h.open} – {h.close}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-2.5 rounded-xl border border-border bg-muted p-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <MapPin className="size-3.5 text-primary" />
          <span>{t("locationAndAddress")}</span>
        </div>
        <p className="text-sm font-semibold text-foreground leading-relaxed">{salon.address}</p>
        {salon.landmark && <p className="text-xs text-muted-foreground">{salon.landmark}</p>}

        <div className="mt-2 flex flex-wrap gap-2">
          <CopyAddressButton address={salon.address} />
          <a
            href={`tel:${salon.phone}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-background px-3.5 text-xs font-bold text-foreground transition-colors hover:bg-muted"
            dir="ltr"
          >
            <Phone className="size-3.5 text-primary" />
            <span className="tabular">{salon.phone}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
