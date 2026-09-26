import { CalendarDays, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { chipVariants } from "@/components/atoms/chip";
import { formatDayMonth } from "@/lib/utils/format/date.utils";
import { cn } from "@/lib/utils/cn.utils";

function DateStrip() {
  const t = useTranslations("marketing.search.dateStrip");
  const locale = useLocale();
  const today = new Date().toISOString();

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <span className="text-[12.5px] font-semibold text-muted-foreground">{t("slotsFor")}</span>
      <span className={cn(chipVariants({ variant: "selected" }))}>{t("today")}</span>
      <span
        aria-disabled
        className={cn(chipVariants(), "cursor-not-allowed text-muted-foreground opacity-60")}
      >
        {t("tomorrow")}
      </span>
      <span
        aria-disabled
        className={cn(chipVariants(), "cursor-not-allowed gap-2 text-muted-foreground opacity-60")}
      >
        {t("anotherDate")}
        <ChevronDown aria-hidden className="size-3.5" />
      </span>
      <span className="flex items-center gap-1.5 text-[12.5px] text-muted-foreground sm:ms-auto">
        <CalendarDays aria-hidden className="size-3.5 shrink-0" />
        {t("allSlotsToday", { date: formatDayMonth(today, locale) })}
      </span>
    </div>
  );
}

export { DateStrip };
