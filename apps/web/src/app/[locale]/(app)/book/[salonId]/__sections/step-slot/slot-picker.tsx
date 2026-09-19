import { ChevronDown, Calendar, Sun, Sunset, Moon } from "lucide-react";
import { Period, PERIOD_LABEL, groupByPeriod } from "@/lib/utils/availability.utils";
import { formatTime } from "@/lib/utils/format/date.utils";
import type { Slot } from "@/lib/types/slot/slot.interface";

const PERIOD_ORDER = [Period.AFTERNOON, Period.EVENING, Period.MORNING] as const;

const PERIOD_ICONS = {
  [Period.MORNING]: Sun,
  [Period.AFTERNOON]: Sunset,
  [Period.EVENING]: Moon,
} as const;

type SlotPickerProps = {
  dates: Date[];
  selectedDate: Date;
  slots: Slot[];
  selectedSlot: string | null;
  totalMinutes?: number;
  avgDelayMinutes?: number;
  recentBookingsSampled?: number;
  onDateChange: (date: Date) => void;
  onSlotChange: (iso: string | null) => void;
};

const ARABIC_DAYS = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

function getRelativeDayLabel(d: Date, index: number): string {
  if (index === 0) return "اليوم";
  if (index === 1) return "غداً";
  return ARABIC_DAYS[d.getDay()];
}

function formatDateLabel(d: Date): string {
  return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]}`;
}

export function SlotPicker({
  dates,
  selectedDate,
  slots,
  selectedSlot,
  totalMinutes = 50,
  avgDelayMinutes = 4,
  recentBookingsSampled = 30,
  onDateChange,
  onSlotChange,
}: SlotPickerProps) {
  const grouped = groupByPeriod(slots);

  return (
    <section
      id="f4"
      className="rounded-[14px] border border-border bg-white overflow-hidden"
    >
      {/* رأس القسم بشريط ملون مطابق لتصميم FRAME 07 */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-accent border-b border-tint-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-primary" />
          <h2 className="text-[15px] font-bold text-foreground">المواعيد الفاضية</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          المدة اللي اخترتها <span className="tabular font-bold text-primary-pressed">{totalMinutes} دقيقة</span> · المعروض مواعيد تكفيها
        </span>
      </div>

      <div className="p-5 sm:p-6">
        {/* شريط الأيام الأفقي مطابق لتصميم FRAME 07 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {dates.map((d, i) => {
            const isSelected = d.toDateString() === selectedDate.toDateString();
            return (
              <button
                key={d.toISOString()}
                type="button"
                onClick={() => onDateChange(d)}
                className={`flex h-[62px] min-w-[90px] shrink-0 flex-col items-center justify-center rounded-[10px] px-3 transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-foreground hover:bg-secondary/60"
                }`}
              >
                <span
                  className={`text-[11.5px] font-semibold leading-tight ${
                    isSelected ? "text-white/85" : "text-muted-foreground"
                  }`}
                >
                  {getRelativeDayLabel(d, i)}
                </span>
                <span className="tabular text-[15px] font-bold leading-tight mt-0.5">
                  {formatDateLabel(d)}
                </span>
              </button>
            );
          })}

          {/* زر اختيار يوم آخر */}
          <button
            type="button"
            className="flex h-[62px] w-[96px] shrink-0 flex-col items-center justify-center gap-1 rounded-[10px] border border-border bg-secondary px-3 text-[12.5px] font-bold text-foreground transition-colors hover:bg-secondary/80 cursor-pointer"
          >
            <span>تاريخ تاني</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* شبكة رقائق الأوقات مقسمة حسب الفترة مطابق لتصميم FRAME 07 */}
        <div className="mt-5 flex flex-col gap-4">
          {PERIOD_ORDER.map((period) => {
            const periodSlots = grouped[period];
            if (!periodSlots || periodSlots.length === 0) return null;
            const PeriodIcon = PERIOD_ICONS[period];

            return (
              <div key={period} className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <PeriodIcon className="size-3.5 text-muted-foreground" />
                  <span>{PERIOD_LABEL[period]}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {periodSlots.map((slot) => {
                    const isSelected = slot.startAt === selectedSlot;
                    const isAvailable = slot.available;

                    if (!isAvailable) {
                      return (
                        <span
                          key={slot.startAt}
                          className="inline-flex h-[46px] items-center rounded-[9px] bg-disabled-bg px-5 text-[15px] font-bold text-disabled-fg line-through tabular select-none cursor-not-allowed"
                        >
                          {formatTime(slot.startAt)}
                        </span>
                      );
                    }

                    return (
                      <button
                        key={slot.startAt}
                        type="button"
                        onClick={() => onSlotChange(isSelected ? null : slot.startAt)}
                        className={`inline-flex h-[46px] items-center rounded-[9px] px-5 text-[15px] font-bold tabular transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-primary text-white font-extrabold ring-3 ring-accent"
                            : "border border-border bg-white text-foreground hover:bg-secondary"
                        }`}
                      >
                        {formatTime(slot.startAt)}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* دليل حالات المواعيد (فاضي / محجوز / اللي اخترته) مطابق لـ FRAME 07 */}
        <div className="mt-4 flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
          <div className="flex items-center gap-1.75">
            <span className="size-3.5 rounded-[4px] border border-border bg-white" />
            <span className="text-xs text-muted-foreground">فاضي</span>
          </div>
          <div className="flex items-center gap-1.75">
            <span className="size-3.5 rounded-[4px] bg-disabled-bg" />
            <span className="text-xs text-muted-foreground">محجوز</span>
          </div>
          <div className="flex items-center gap-1.75">
            <span className="size-3.5 rounded-[4px] bg-primary" />
            <span className="text-xs text-muted-foreground">اللي اخترته</span>
          </div>
        </div>

        {/* مؤشر الالتزام بالمواعيد — FRAME 01 Meaningful Color */}
        <div className="mt-5 flex flex-wrap items-center gap-2 sm:gap-2.5 rounded-[10px] border border-[#BBF7D0] bg-success-bg px-3.5 py-2.5">
          <span className="size-2 shrink-0 rounded-full bg-success" />
          <span className="text-xs font-bold text-success-strong">
            الصالون في ميعاده
          </span>
          <span className="text-xs text-muted-foreground tabular">
            آخر {recentBookingsSampled} ميعاد بمتوسط تأخير {avgDelayMinutes} دقايق
          </span>
        </div>
      </div>
    </section>
  );
}
