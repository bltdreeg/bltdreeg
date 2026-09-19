'use client';
// خطوة الميعاد: دلوقتي (طابور) أو احجز معاد (يوم وساعة)
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK_BARBER } from "@/lib/data/constants/routes.constants";
import { isOpenNow } from "@/lib/utils/hours.utils";
import { daySlotsForShop } from "@/lib/utils/availability.utils";
import type { SalonDetails } from "@/lib/types/salon";
import { SlotPicker } from "./slot-picker";

type StepSlotProps = {
  salon: SalonDetails;
  totalMinutes: number;
  queryString: string;
  barberName?: string;
};

function buildDates(count: number): Date[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    d.setHours(0, 0, 0, 0);
    return d;
  });
}

const DAYS_AHEAD = 5;

export function StepSlot({
  salon,
  totalMinutes,
  queryString,
}: StepSlotProps) {
  const [mode, setMode] = useState<"now" | "schedule">("schedule");
  const [date, setDate] = useState<Date>(() => buildDates(1)[0]);

  const open = isOpenNow(salon.hours);
  const dates = buildDates(DAYS_AHEAD);
  const slots = daySlotsForShop(salon, date, totalMinutes);

  const defaultSlot =
    slots.find(
      (s) =>
        s.available &&
        new Date(s.startAt).getHours() === 18 &&
        new Date(s.startAt).getMinutes() === 30,
    )?.startAt ??
    slots.find((s) => s.available)?.startAt ??
    null;

  const [slotAt, setSlotAt] = useState<string | null>(() => defaultSlot);
  const effectiveSlot =
    slotAt && slots.some((s) => s.startAt === slotAt && s.available) ? slotAt : defaultSlot;

  const nextUrl = (() => {
    const p = new URLSearchParams(queryString);
    if (mode === "now") {
      p.set("when", "now");
    } else {
      if (!effectiveSlot) return null;
      p.set("when", effectiveSlot);
    }
    return `${ROUTE_BOOK_BARBER(salon.id)}?${p.toString()}`;
  })();

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setMode("now")}
        disabled={!open}
        className={`flex items-center gap-4 rounded-[14px] border p-4 text-start transition-colors ${
          mode === "now" ? "border-2 border-primary bg-accent" : "border-border"
        } ${!open ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
      >
        <span
          className={`size-5 shrink-0 rounded-full border-[6px] ${
            mode === "now" ? "border-primary bg-background" : "border-border bg-background"
          }`}
        />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[15px] font-extrabold text-foreground">دلوقتي — ادخل الطابور</span>
            {open && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                <span className="relative flex size-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-emerald-600" />
                </span>
                <span>لايف</span>
              </span>
            )}
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground tabular">
            {!open
              ? "الصالون مقفول دلوقتي — احجز معاد"
              : salon.queue.peopleAhead === 0
                ? "مفيش دور — هتدخل على طول"
                : salon.queue.peopleAhead === 1
                  ? `قدامك 1 بس · ~${salon.queue.waitMinutes} د`
                  : `قدامك ${salon.queue.peopleAhead} · ~${salon.queue.waitMinutes} د`}
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => setMode("schedule")}
        className={`flex items-center gap-4 rounded-[14px] border p-4 text-start transition-colors cursor-pointer ${
          mode === "schedule" ? "border-2 border-primary bg-accent" : "border-border bg-white"
        }`}
      >
        <span
          className={`size-5 shrink-0 rounded-full border-[6px] ${
            mode === "schedule" ? "border-primary bg-background" : "border-border bg-background"
          }`}
        />
        <div>
          <span className="text-[15px] font-extrabold text-foreground">احجز معاد</span>
          <p className="mt-1 text-[13px] text-muted-foreground">اختار اليوم والساعة اللي تناسبك</p>
        </div>
      </button>

      {mode === "schedule" && (
        <SlotPicker
          dates={dates}
          selectedDate={date}
          slots={slots}
          selectedSlot={effectiveSlot}
          totalMinutes={totalMinutes}
          avgDelayMinutes={salon.avgDelayMinutes}
          recentBookingsSampled={salon.recentBookingsSampled}
          onDateChange={(d) => {
            setDate(d);
            setSlotAt(null);
          }}
          onSlotChange={setSlotAt}
        />
      )}

      {nextUrl ? (
        <Link
          href={nextUrl}
          className="flex h-[44px] w-full items-center justify-center rounded-[10px] bg-primary text-[15px] font-bold text-white transition-colors hover:bg-primary-pressed cursor-pointer"
        >
          كمّل — اختار الحلاق
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="flex h-[44px] w-full items-center justify-center rounded-[10px] bg-disabled-bg text-[15px] font-bold text-disabled-fg"
        >
          اختار ميعاد الأول
        </button>
      )}
    </div>
  );
}
