"use client";

// شريط خطوات الحجز (FRAME 07): الخدمات (اتختارت في صفحة الصالون) ← الحلاق ← وقت الدخول ← المراجعة
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import type { BookingStep } from "@/lib/utils/reservations/booking-flow-params";
import { cn } from "@/lib/utils/cn.utils";

const ORDER: BookingStep[] = ["barber", "when", "review"];

export type BookingStepperProps = {
  step: BookingStep;
  serviceSummary?: string;
  barberSummary?: string;
  whenSummary?: string;
};

export function BookingStepper({ step, serviceSummary, barberSummary, whenSummary }: BookingStepperProps) {
  const t = useTranslations("app.bookFlow.stepper");
  const current = ORDER.indexOf(step) + 1; // الخدمات = 0 ودايماً خلصت

  const steps = [
    { title: t("services"), summary: serviceSummary },
    { title: t("barber"), summary: barberSummary },
    { title: t("when"), summary: whenSummary },
    { title: t("review"), summary: undefined },
  ].map((s, index) => ({
    ...s,
    number: index + 1,
    isDone: index < current,
    isCurrent: index === current,
  }));

  return (
    <ol className="flex w-full items-center">
      {steps.map((s, index) => {
        const isLast = index === steps.length - 1;

        return (
          <li
            key={s.number}
            aria-current={s.isCurrent ? "step" : undefined}
            className={cn("flex items-center", !isLast && "flex-1")}
          >
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {s.isDone ? (
                <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-4 stroke-[2.5]" />
                </div>
              ) : (
                <div
                  className={cn(
                    "flex size-[30px] shrink-0 items-center justify-center rounded-full text-sm tabular-nums",
                    s.isCurrent
                      ? "bg-primary font-extrabold text-white"
                      : "border-[1.5px] border-border bg-white font-bold text-disabled-fg",
                  )}
                >
                  {s.number}
                </div>
              )}

              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-[13.5px] leading-tight sm:text-[14.5px]",
                    // على الموبايل عنوان الخطوة الحالية بس — الأربعة مع بعض مبيكفوش العرض
                    !s.isCurrent && "hidden sm:inline",
                    s.isCurrent ? "font-bold text-foreground" : s.isDone ? "font-semibold text-foreground" : "font-semibold text-disabled-fg",
                  )}
                >
                  {s.title}
                </span>
                {(s.isDone ? s.summary : s.isCurrent ? t("selectingNow") : undefined) && (
                  <span
                    className={cn(
                      "hidden max-w-[160px] truncate text-[11.5px] leading-tight sm:inline-block",
                      s.isCurrent ? "font-medium text-primary-pressed" : "text-muted-foreground",
                    )}
                  >
                    {s.isDone ? s.summary : t("selectingNow")}
                  </span>
                )}
              </div>
            </div>

            {!isLast && (
              <div className={cn("mx-2 h-[1.5px] flex-1 sm:mx-4.5", s.isDone ? "bg-primary" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
