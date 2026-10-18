"use client";

// خطوة الوقت: "ادخل الطابور دلوقتي" (لو الصالون مفتوح) أو "احجز ميعاد دخول".
// الميعاد مش ميعاد خدمة: بتدخل طابور الحلاق لما الوقت ييجي، ورا اللي في الطابور ساعتها (feature 1)
import { CalendarClock, Info, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Skeleton } from "@/components/atoms/skeleton";
import { useChairSlots } from "@/lib/hooks/reservations";
import type { BranchBarber } from "@/lib/types/reservation";
import { cn } from "@/lib/utils/cn.utils";
import { groupSlotsByDay } from "@/lib/utils/reservations/reservation-mapper";
import { formatClock, slotDayLabel } from "@/lib/utils/reservations/slot-format";

type StepWhenProps = {
  branchId: string;
  barber: BranchBarber;
  onJoinNow: () => void;
  onPickSlot: (slotId: string) => void;
};

export function StepWhen({ branchId, barber, onJoinNow, onPickSlot }: StepWhenProps) {
  const t = useTranslations("app.bookFlow.when");
  const locale = useLocale();
  // لو مينفعش تدخل دلوقتي (الصالون مقفول) المواعيد بتتفتح على طول
  const [showSlots, setShowSlots] = useState(!barber.canJoinNow);
  const slots = useChairSlots(branchId, barber.chairId, showSlots);
  const days = groupSlotsByDay(slots.data ?? []);
  const dayText = (day: string) => {
    const label = slotDayLabel(day, locale);
    return label.kind === "date" ? label.label : t(label.kind);
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onJoinNow}
        disabled={!barber.canJoinNow}
        className="flex items-start gap-3.5 rounded-[14px] border border-border bg-card p-4.5 text-start transition-colors enabled:cursor-pointer enabled:hover:border-primary disabled:opacity-60"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-tint text-primary-pressed">
          <Zap aria-hidden className="size-5" />
        </span>
        <span className="flex flex-col gap-1">
          <span className="text-[15.5px] font-bold text-foreground">{t("joinNow")}</span>
          <span className="text-[13px] leading-relaxed text-muted-foreground">
            {!barber.canJoinNow
              ? t("closedNow")
              : barber.queue.peopleInQueue === 0
                ? t("joinNowEmpty")
                : t("joinNowQueue", { count: barber.queue.peopleInQueue, minutes: barber.queue.expectedWaitMinutes })}
          </span>
        </span>
      </button>

      <div className="rounded-[14px] border border-border bg-card">
        <button
          type="button"
          onClick={() => setShowSlots(true)}
          aria-expanded={showSlots}
          className="flex w-full items-start gap-3.5 p-4.5 text-start cursor-pointer"
        >
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
            <CalendarClock aria-hidden className="size-5" />
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-[15.5px] font-bold text-foreground">{t("reserve")}</span>
            <span className="text-[13px] leading-relaxed text-muted-foreground">{t("reserveDesc")}</span>
          </span>
        </button>

        {showSlots && (
          <div className="flex flex-col gap-4 border-t border-border p-4.5">
            <p className="flex items-start gap-2 rounded-xl bg-warning-bg/70 px-3 py-2.5 text-[12.5px] leading-relaxed text-warning-fg">
              <Info aria-hidden className="mt-0.5 size-3.5 shrink-0" />
              {t("slotExplainer")}
            </p>

            {slots.isPending ? (
              <div role="status" className="flex flex-wrap gap-2">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton key={i} className="h-10 w-20 rounded-[10px]" />
                ))}
              </div>
            ) : slots.isError ? (
              <p role="alert" className="text-sm text-destructive">
                {t("slotsError")}
              </p>
            ) : days.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("noSlots")}</p>
            ) : (
              days.map(({ day, slots: daySlots }) => (
                <div key={day} className="flex flex-col gap-2">
                  <h3 className="text-[13px] font-bold text-muted-foreground">{dayText(day)}</h3>
                  <div className="flex flex-wrap gap-2">
                    {daySlots.map((slot) => (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => onPickSlot(slot.id)}
                        className={cn(
                          "tabular h-10 rounded-[10px] border border-border bg-background px-3.5 text-[13.5px] font-bold text-foreground transition-colors cursor-pointer hover:border-primary hover:bg-tint",
                        )}
                      >
                        {formatClock(slot.time, locale)}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
