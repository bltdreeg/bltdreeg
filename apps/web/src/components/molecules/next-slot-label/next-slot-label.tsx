// أقرب ميعاد: النهارده 6:30 م — الوقت أكبر عنصر، ده اللي بيبيع
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
  if (!slotAt) {
    return (
      <div className={cn("flex flex-col gap-1.5", className)}>
        <span className="text-[11.5px] font-semibold tracking-[0.04em] text-muted-foreground">
          مفيش مواعيد
        </span>
        <span className="text-[20px] font-bold text-muted-foreground">خلاص النهارده</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-[11.5px] font-semibold tracking-[0.04em] text-muted-foreground">
        أقرب ميعاد · {formatDayLabel(slotAt)}
      </span>
      <span
        className={cn(
          "tabular text-[26px] font-bold leading-none md:text-[30px]",
          muted ? "text-muted-foreground" : "text-foreground",
        )}
      >
        {formatTime(slotAt)}
      </span>
    </div>
  );
}

export { NextSlotLabel };
