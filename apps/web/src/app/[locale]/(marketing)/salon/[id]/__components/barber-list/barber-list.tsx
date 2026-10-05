"use client";
// قائمة الحلاقين — استعراض بس، اختيار الحلاق بيحصل في مسار الحجز (فريم ٢٢)
import { Star, Clock, Check, Users } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import type { Barber } from "@/lib/types/barber/barber.interface";
import { barberOffReturns, barberQueueAhead, yearsExperience } from "@/lib/utils/format/queue-labels.utils";

type BarberListProps = {
  barbers: Barber[];
};

/** استخراج الحرفين الأولين للاسم */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]} ${parts[1][0]}`;
  }
  return parts[0]?.[0] || "";
}

export function BarberList({ barbers }: BarberListProps) {
  const t = useTranslations("marketing.salon.barbers");
  const locale = useLocale();

  return (
    <section id="barbers" className="scroll-mt-28 px-4 sm:px-8 lg:rounded-[14px] lg:border lg:border-border lg:bg-background lg:p-6 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-base font-bold text-foreground">{t("title")}</h2>

      <div className="flex flex-col">
        {barbers.map((barber, i) => (
          <div
            key={barber.id}
            className={`flex items-center gap-3 py-3 ${barber.queue === null ? "opacity-60" : ""} ${
              i < barbers.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex size-13 shrink-0 items-center justify-center rounded-full border border-tint-border bg-accent text-base font-bold text-accent-foreground">
              {getInitials(barber.name)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-[15px] font-bold text-foreground">{barber.name}</span>
                <span className="flex shrink-0 items-center gap-1 text-xs">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="tabular font-bold text-foreground">{barber.rating}</span>
                  <span className="tabular text-muted-foreground">({barber.reviewCount})</span>
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>{barber.specialty}</span>
                {barber.queue !== null && (
                  <>
                    <span>·</span>
                    <span>{yearsExperience(barber.experienceYears, locale)}</span>
                  </>
                )}
              </div>
              <div className="mt-1.5">
                {barber.queue === null ? (
                  <BarberStatusPill tone="off" label={barberOffReturns(barber.returnsOnDay ?? t("tomorrow"), locale)} />
                ) : barber.queue.peopleAhead === 0 ? (
                  <BarberStatusPill tone="free" label={t("availableNow")} />
                ) : (
                  <BarberStatusPill
                    tone={barber.queue.peopleAhead <= 3 ? "moderate" : "busy"}
                    label={barberQueueAhead(barber.queue.peopleAhead, barber.queue.waitMinutes, locale)}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const TONE_CLASSES = {
  off: "bg-muted text-muted-foreground",
  free: "bg-success-bg text-success-strong",
  moderate: "bg-warning-bg text-warning-fg",
  busy: "bg-warning-bg text-warning-fg",
} as const;

function BarberStatusPill({ tone, label }: { tone: keyof typeof TONE_CLASSES; label: string }) {
  const Icon = {
    off: Clock,
    free: Check,
    moderate: Users,
    busy: Users,
  }[tone];

  return (
    <span className={`inline-flex h-6 items-center gap-1.25 rounded-lg px-2 text-[11px] font-bold ${TONE_CLASSES[tone]}`}>
      <Icon className="size-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
}
