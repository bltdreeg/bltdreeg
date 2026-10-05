import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn.utils";
import { formatDayLabel, formatTime } from "@/lib/utils/format/date.utils";

type NextSlotLabelProps = {
  /** أقرب ميعاد فاضي — null يعني مفيش مواعيد خلاص */
  slotAt: string | null;
  /** الحالة الخافتة: الصالون مفيهوش مواعيد النهارده */
  muted?: boolean;
  className?: string;
};

function NextSlotLabel({ slotAt, muted = false, className }: NextSlotLabelProps) {
  const t = useTranslations("common.nextSlot");
  const locale = useLocale();

  if (!slotAt) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <span className="text-[11.5px] font-semibold tracking-[0.04em] text-muted-foreground">
          {t("noSlots")}
        </span>
        <span className="text-[20px] font-bold text-muted-foreground">{t("leftToday")}</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[10.5px] sm:text-[11.5px] font-semibold tracking-[0.02em] sm:tracking-[0.04em] text-muted-foreground leading-tight">
        {t("nearestSlot")} · {formatDayLabel(slotAt, locale)}
      </span>
      <span
        className={cn(
          "tabular text-[20px] sm:text-[24px] md:text-[30px] font-bold leading-none",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {formatTime(slotAt, locale)}
      </span>
    </div>
  );
}

export { NextSlotLabel };
