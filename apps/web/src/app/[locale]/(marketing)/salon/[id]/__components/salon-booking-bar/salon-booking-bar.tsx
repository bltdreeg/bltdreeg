"use client";
// شريط الحجز السفلي (موبايل) — الإجمالي وزرار "احجز" لمسار الحجز
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { selectionCount } from "@/lib/utils/format/queue-labels.utils";
import type { BranchService } from "@/lib/types/branch";

type SalonBookingBarProps = {
  bookHref: string | null;
  selectedServices: BranchService[];
};

export function SalonBookingBar({ bookHref, selectedServices }: SalonBookingBarProps) {
  const t = useTranslations("marketing.salon.bookingBar");
  const locale = useLocale();
  const count = selectedServices.length;
  const total = selectedServices.reduce((n, s) => n + s.price, 0);

  return (
    <div className="sticky bottom-0 z-30 flex w-full items-center gap-3 border-t border-border bg-background px-4 sm:px-8 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-muted-foreground">{selectionCount(count, locale)}</span>
        <span className="tabular text-[17px] font-extrabold text-foreground">
          {count === 0 ? "—" : formatPrice(total, locale)}
        </span>
      </div>

      {bookHref ? (
        <Link
          href={bookHref}
          className="flex h-13 flex-1 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-pressed"
        >
          {t("book")}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="flex h-13 flex-1 items-center justify-center rounded-xl bg-disabled-bg font-bold text-disabled-fg"
        >
          {t("book")}
        </button>
      )}
    </div>
  );
}
