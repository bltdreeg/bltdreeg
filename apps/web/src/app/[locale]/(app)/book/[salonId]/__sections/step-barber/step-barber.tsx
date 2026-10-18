"use client";

// خطوة اختيار الحلاق: كل كرسي شغال النهارده بطابوره دلوقتي — "قدامك كام" والانتظار المتوقع لو دخلت دلوقتي
import { Check, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar } from "@/components/atoms/avatar";
import { Skeleton } from "@/components/atoms/skeleton";
import type { BranchBarber } from "@/lib/types/reservation";
import { cn } from "@/lib/utils/cn.utils";

type StepBarberProps = {
  barbers: BranchBarber[] | undefined;
  isLoading: boolean;
  selectedChairId: string | null;
  onSelect: (chairId: string) => void;
};

export function StepBarber({ barbers, isLoading, selectedChairId, onSelect }: StepBarberProps) {
  const t = useTranslations("app.bookFlow.barber");

  if (isLoading) {
    return (
      <div role="status" className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[92px] rounded-[14px]" />
        ))}
      </div>
    );
  }

  if (!barbers || barbers.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-border bg-muted px-4 py-10 text-center text-sm text-muted-foreground">
        {t("none")}
      </p>
    );
  }

  return (
    <div role="radiogroup" aria-label={t("title")} className="grid gap-3 sm:grid-cols-2">
      {barbers.map((row) => {
        const selected = row.chairId === selectedChairId;
        const { peopleInQueue, expectedWaitMinutes } = row.queue;

        return (
          <button
            key={row.chairId}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onSelect(row.chairId)}
            className={cn(
              "flex items-center gap-3.5 rounded-[14px] border bg-card p-4 text-start transition-colors cursor-pointer",
              selected ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/50",
            )}
          >
            <Avatar name={row.barber.name} size={48} className="shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="truncate text-[15px] font-bold text-foreground">{row.barber.name}</span>
              <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <Users aria-hidden className="size-3.5 shrink-0" />
                {peopleInQueue === 0
                  ? t("queueEmpty")
                  : t("queueSize", { count: peopleInQueue, minutes: expectedWaitMinutes })}
              </span>
            </div>
            <span
              aria-hidden
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                selected ? "border-primary bg-primary text-white" : "border-border",
              )}
            >
              {selected && <Check className="size-3.5 stroke-[3]" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
