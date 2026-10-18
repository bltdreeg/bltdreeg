"use client";

// ملخص الحجز الجانبي: الصالون والخدمات (بسعر الفرع) والحلاق ووقت الدخول
import { Clock, Scissors, User } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import type { BranchDetail, BranchService } from "@/lib/types/branch";
import { formatPrice } from "@/lib/utils/format/price.utils";

type BookingSummaryPanelProps = {
  branch: BranchDetail;
  services: BranchService[];
  barberName?: string;
  whenLabel?: string;
};

export function BookingSummaryPanel({ branch, services, barberName, whenLabel }: BookingSummaryPanelProps) {
  const t = useTranslations("app.bookFlow.summary");
  const locale = useLocale();
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0);
  const totalMinutes = services.reduce((sum, s) => sum + s.durationMinutes, 0);

  return (
    <div className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 border-b border-border p-4.5">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
          {branch.coverImageUrl ? (
            <Image src={branch.coverImageUrl} alt={branch.salon.name} fill sizes="48px" className="object-cover" />
          ) : (
            <Scissors aria-hidden className="absolute inset-0 m-auto size-5 text-muted-foreground" />
          )}
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[15px] font-bold text-foreground">{branch.salon.name}</span>
          <span className="truncate text-[12.5px] text-muted-foreground">
            {branch.name} · {branch.city.name}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-border/80 px-4.5">
        {services.map((service) => (
          <li key={service.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold text-foreground">{service.name}</span>
              <span className="text-[11.5px] text-muted-foreground">{t("minutes", { count: service.durationMinutes })}</span>
            </div>
            <span className="tabular shrink-0 text-sm font-bold">{formatPrice(service.price, locale)}</span>
          </li>
        ))}
      </ul>

      <dl className="flex flex-col gap-2.5 border-t border-border p-4.5 text-[13.5px]">
        {barberName && (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <User aria-hidden className="size-3.5" />
              {t("barber")}
            </dt>
            <dd className="font-bold text-foreground">{barberName}</dd>
          </div>
        )}
        {whenLabel && (
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-1.5 text-muted-foreground">
              <Clock aria-hidden className="size-3.5" />
              {t("when")}
            </dt>
            <dd className="text-end font-bold text-foreground">{whenLabel}</dd>
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">{t("duration")}</dt>
          <dd className="tabular font-bold text-foreground">{t("minutes", { count: totalMinutes })}</dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3 border-t border-border pt-3">
          <dt className="font-bold text-muted-foreground">{t("total")}</dt>
          <dd className="tabular text-2xl font-black text-foreground">{formatPrice(totalPrice, locale)}</dd>
        </div>
      </dl>
    </div>
  );
}
