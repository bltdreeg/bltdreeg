'use client';
// خطوة الحلاق: أي حلاق متاح (افتراضي) أو اختيار بالاسم — فريم ٢٤ (mobile)
import { useState } from "react";
import { Users, Star } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK_REVIEW } from "@/lib/data/constants/routes.constants";
import { peopleAheadOfBarber } from "@/lib/utils/format/queue-labels.utils";
import type { Barber } from "@/lib/types/barber/barber.interface";

type StepBarberProps = {
  salonId: string;
  barbers: Barber[];
  queryString: string;
};

export function StepBarber({ salonId, barbers, queryString }: StepBarberProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const p = new URLSearchParams(queryString);
  p.set("barber", selectedId ?? "any");
  const nextUrl = `${ROUTE_BOOK_REVIEW(salonId)}?${p.toString()}`;

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={() => setSelectedId(null)}
        className={`flex items-center gap-4 rounded-[14px] border-2 p-4 text-start transition-colors cursor-pointer ${
          selectedId === null ? "border-primary bg-accent" : "border-border"
        }`}
      >
        <span className="flex size-14 shrink-0 items-center justify-center rounded-full border border-dashed border-tint-border bg-background text-primary">
          <Users className="size-6 text-primary" />
        </span>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-primary-pressed">أي حلاق متاح</span>
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10.5px] font-extrabold text-primary-foreground">
              الأسرع
            </span>
          </div>
          <p className="mt-1 text-[13px] text-foreground">أول واحد يخلّص هيستلمك</p>
        </div>
        <div className="shrink-0 text-end">
          <div className="text-[14px] font-extrabold text-success-strong">فوراً</div>
          <div className="text-xs text-success">مفيش دور</div>
        </div>
      </button>

      <span className="text-[13px] font-bold text-muted-foreground">أو اختار حلاق بالاسم</span>

      {barbers.map((barber) => {
        const off = barber.queue === null;
        const selected = selectedId === barber.id;
        return (
          <button
            key={barber.id}
            type="button"
            disabled={off}
            onClick={() => setSelectedId(barber.id)}
            className={`flex items-center gap-3 rounded-[14px] border p-3.5 text-start transition-colors ${
              selected ? "border-2 border-primary bg-accent" : "border-border"
            } ${off ? "cursor-not-allowed opacity-55" : "cursor-pointer"}`}
          >
            <span
              className={`size-5 shrink-0 rounded-full border-[1.8px] ${
                off ? "border-disabled-bg bg-disabled-bg" : selected ? "border-primary" : "border-border"
              }`}
            />
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-tint-border bg-accent text-sm font-bold text-accent-foreground">
              {barber.name.split(" ").slice(0, 2).map((w) => w[0]).join(" ")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[14.5px] font-bold text-foreground">{barber.name}</span>
                {!off && (
                  <span className="flex shrink-0 items-center gap-1 text-xs">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" />
                    <span className="tabular font-bold text-foreground">{barber.rating}</span>
                  </span>
                )}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {off ? "مش موجود النهارده" : barber.specialty}
              </div>
            </div>
            {!off && barber.queue && (
              <div className="shrink-0 text-end">
                {barber.queue.peopleAhead === 0 ? (
                  <>
                    <div className="text-[13.5px] font-extrabold text-success-strong">فوراً</div>
                    <div className="text-xs text-muted-foreground">فاضي</div>
                  </>
                ) : (
                  <>
                    <div className="text-[13.5px] font-extrabold text-warning-fg">+{barber.queue.waitMinutes} د</div>
                    <div className="text-xs text-muted-foreground">{peopleAheadOfBarber(barber.queue.peopleAhead)}</div>
                  </>
                )}
              </div>
            )}
          </button>
        );
      })}

      {/* شريط الإجراء: ثابت بالأسفل على الموبايل والتابلت، ومكانه الطبيعي على الويب (الديسكتوب) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card px-5 pt-3 pb-[max(1.375rem,env(safe-area-inset-bottom))] shadow-[0_-6px_24px_rgba(14,15,17,0.07)] lg:static lg:z-auto lg:border-t-0 lg:bg-transparent lg:p-0 lg:shadow-none">
        <div className="mx-auto w-full max-w-lg lg:max-w-none">
          <Link
            href={nextUrl}
            className="flex h-[52px] lg:h-[44px] w-full items-center justify-center rounded-[10px] bg-primary text-base lg:text-[15px] font-bold text-white shadow-sm lg:shadow-none transition-colors hover:bg-primary-pressed cursor-pointer"
          >
            كمّل — راجع الحجز
          </Link>
        </div>
      </div>
    </div>
  );
}
