"use client";

// شريط الخطوات لمسار الحجز مطابق لتصميم FRAME 07
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn.utils";

export type BookingStepperProps = {
  step: 1 | 2 | 3 | 4;
  serviceSummary?: string;
  barberSummary?: string;
  slotSummary?: string;
};

export function BookingStepper({
  step,
  serviceSummary,
  barberSummary,
  slotSummary,
}: BookingStepperProps) {
  const t = useTranslations("app.book.stepper");
  const isStep1Done = step > 1;
  const isStep1Current = step === 1;

  const isStep2Done = step > 2;
  const isStep2Current = step === 2;

  const isStep3Done = step > 3;
  const isStep3Current = step === 3;

  const steps = [
    {
      number: 1,
      title: t("service"),
      isDone: isStep1Done,
      isCurrent: isStep1Current,
      subtitle: isStep1Done
        ? (serviceSummary ?? "خدمتين · 180 ج.م")
        : isStep1Current
          ? t("selectingNow")
          : undefined,
    },
    {
      number: 2,
      title: t("slot"),
      isDone: isStep2Done,
      isCurrent: isStep2Current,
      subtitle: isStep2Done
        ? (slotSummary ?? t("slotSelected"))
        : isStep2Current
          ? t("selectingNow")
          : undefined,
    },
    {
      number: 3,
      title: t("barber"),
      isDone: isStep3Done,
      isCurrent: isStep3Current,
      subtitle: isStep3Done
        ? (barberSummary ?? "كريم مصطفى")
        : isStep3Current
          ? t("selectingNow")
          : undefined,
    },
  ];

  return (
    <div className="flex w-full items-center">
      {steps.map((s, index) => {
        const isLast = index === steps.length - 1;
        const lineActive = index === 0 ? isStep1Done : index === 1 ? isStep2Done : false;

        return (
          <div key={s.number} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              {/* الدائرة 30px */}
              {s.isDone ? (
                <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check className="size-4 stroke-[2.5]" />
                </div>
              ) : s.isCurrent ? (
                <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-primary text-sm font-extrabold text-white tabular-nums">
                  {s.number}
                </div>
              ) : (
                <div className="flex size-[30px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-border bg-white text-sm font-bold text-disabled-fg tabular-nums">
                  {s.number}
                </div>
              )}

              {/* النصوص (العنوان + التفاصيل) */}
              <div className="flex flex-col gap-0.5">
                <span
                  className={cn(
                    "text-[13.5px] leading-tight sm:text-[14.5px]",
                    s.isCurrent
                      ? "font-bold text-foreground"
                      : s.isDone
                        ? "font-semibold text-foreground"
                        : "font-semibold text-disabled-fg",
                  )}
                >
                  {s.title}
                </span>
                {s.subtitle && (
                  <span
                    className={cn(
                      "hidden text-[11.5px] leading-tight sm:inline-block",
                      s.isCurrent ? "font-medium text-primary-pressed" : "text-muted-foreground",
                    )}
                  >
                    {s.subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* الخط الواصل بين الخطوات */}
            {!isLast && (
              <div
                className={cn(
                  "mx-2 h-[1.5px] flex-1 sm:mx-4.5",
                  lineActive ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
