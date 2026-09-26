import { useLocale, useTranslations } from "next-intl";
import { chipVariants } from "@/components/atoms/chip";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK } from "@/lib/data/constants/routes.constants";
import type { Slot } from "@/lib/types/slot/slot.interface";
import type { Period } from "@/lib/utils/availability.utils";
import { formatTime } from "@/lib/utils/format/date.utils";
import { cn } from "@/lib/utils/cn.utils";

type SlotChipsProps = {
  shopId: string;
  period: Period;
  slots: Slot[];
};

function SlotChips({ shopId, period, slots }: SlotChipsProps) {
  const t = useTranslations("marketing.search.slotChips");
  const locale = useLocale();

  if (slots.length === 0) return null;
  // أقصى 3 شرايح في الصف — الرابع بيكسر عرض الكارت
  const shown = slots.slice(0, 3);
  const periodLabel = t(`periods.${period}`);

  return (
    <div className="relative z-[2] flex flex-col gap-2.5">
      <span className="text-[11.5px] font-semibold text-muted-foreground">
        {t("slotsToday", { period: periodLabel })}
      </span>
      <ul className="flex gap-2">
        {shown.map((slot) => (
          <li key={slot.startAt} className="flex-1">
            <Link
              href={`${ROUTE_BOOK(shopId)}?slot=${encodeURIComponent(slot.startAt)}`}
              className={cn(chipVariants({ variant: "tint" }), "tabular w-full")}
            >
              {formatTime(slot.startAt, locale)}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { SlotChips };
