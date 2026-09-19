// الشريط الثابت أسفل الشاشة على الموبايل: عدد الخدمات والسعر وزرار "ادخل الطابور" — فريم ٢١
"use client";

import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK_SLOT } from "@/lib/data/constants/routes.constants";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { selectionCount } from "@/lib/utils/format/queue-labels.utils";
import type { Service } from "@/lib/types/service/service.interface";

type SalonBookingBarProps = {
  salonId: string;
  selectedServices: Service[];
};

export function SalonBookingBar({ salonId, selectedServices }: SalonBookingBarProps) {
  const count = selectedServices.length;
  const total = selectedServices.reduce((n, s) => n + s.price, 0);

  const bookUrl = (() => {
    if (count === 0) return null;
    const p = new URLSearchParams();
    for (const svc of selectedServices) p.append("service", svc.id);
    return `${ROUTE_BOOK_SLOT(salonId)}?${p.toString()}`;
  })();

  return (
    <div className="sticky bottom-0 z-30 flex w-full items-center gap-3 border-t border-border bg-background px-4 sm:px-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-muted-foreground">{selectionCount(count)}</span>
        <span className="tabular text-[17px] font-extrabold text-foreground">
          {count === 0 ? "—" : formatPrice(total)}
        </span>
      </div>

      {bookUrl ? (
        <Link
          href={bookUrl}
          className="flex h-13 flex-1 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-pressed"
        >
          ادخل الطابور
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="flex h-13 flex-1 items-center justify-center rounded-xl bg-disabled-bg font-bold text-disabled-fg"
        >
          ادخل الطابور
        </button>
      )}
    </div>
  );
}
