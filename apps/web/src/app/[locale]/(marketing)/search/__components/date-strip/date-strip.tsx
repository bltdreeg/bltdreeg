// شريط التاريخ: المواعيد المعروضة دلوقتي النهارده بس — بكرة وتاريخ تاني لسه مش موصولين ببيانات
import { CalendarDays, ChevronDown } from "lucide-react";
import { chipVariants } from "@/components/atoms/chip";
import { formatDayMonth } from "@/lib/utils/format/date.utils";
import { cn } from "@/lib/utils/cn.utils";

function DateStrip() {
  const today = new Date().toISOString();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-[12.5px] font-semibold text-muted-foreground">المواعيد في</span>
      <span className={cn(chipVariants({ variant: "selected" }))}>النهارده</span>
      <span
        aria-disabled
        className={cn(chipVariants(), "cursor-not-allowed text-muted-foreground opacity-60")}
      >
        بكرة
      </span>
      <span
        aria-disabled
        className={cn(chipVariants(), "cursor-not-allowed gap-2 text-muted-foreground opacity-60")}
      >
        تاريخ تاني
        <ChevronDown aria-hidden className="size-3.5" />
      </span>
      <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground sm:ms-auto">
        <CalendarDays aria-hidden className="size-3.5 shrink-0" />
        المواعيد المعروضة كلها النهارده {formatDayMonth(today)}
      </span>
    </div>
  );
}

export { DateStrip };
