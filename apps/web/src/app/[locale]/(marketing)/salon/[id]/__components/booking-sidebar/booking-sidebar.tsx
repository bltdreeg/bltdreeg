"use client";
// الشريط الجانبي للحجز (ديسكتوب فقط) — ملخص الحجز وزرار "ادخل الطابور"
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTE_BOOK_SLOT } from "@/lib/data/constants/routes.constants";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { selectionCount } from "@/lib/utils/format/queue-labels.utils";
import { X, Clock } from "lucide-react";
import type { Service } from "@/lib/types/service/service.interface";

type BookingSidebarProps = {
  salonId: string;
  selectedServices: Service[];
  onRemoveService: (id: string) => void;
};

export function BookingSidebar({
  salonId,
  selectedServices,
  onRemoveService,
}: BookingSidebarProps) {
  const t = useTranslations("marketing.salon.bookingSidebar");
  const locale = useLocale();

  const totalPrice = selectedServices.reduce((n, s) => n + s.price, 0);
  const totalMinutes = selectedServices.reduce((n, s) => n + s.durationMinutes, 0);
  const hasServices = selectedServices.length > 0;

  const bookUrl = (() => {
    if (!hasServices) return null;
    const p = new URLSearchParams();
    for (const svc of selectedServices) p.append("service", svc.id);
    return `${ROUTE_BOOK_SLOT(salonId)}?${p.toString()}`;
  })();

  return (
    <div className="flex max-h-full flex-col rounded-[14px] border border-border bg-background p-5 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
      {/* رأس ملخص الحجز */}
      <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
        <h2 className="text-base font-bold text-foreground">{t("title")}</h2>
        <span className="tabular rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
          {t("servicesCount", { count: selectedServices.length })}
        </span>
      </div>

      {/* قائمة الخدمات المختارة (تمرير عند الطول) */}
      <div className="flex flex-col py-3 overflow-y-auto overflow-x-hidden min-h-0">
        {selectedServices.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            {t("empty")}
          </div>
        ) : (
          <div className="divide-y divide-border/80">
            {selectedServices.map((svc) => (
              <div
                key={svc.id}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {svc.name}
                  </span>
                  <span className="tabular text-[11px] text-muted-foreground">
                    {t("durationMinutes", { count: svc.durationMinutes })}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="tabular text-xs font-bold text-foreground">
                    {formatPrice(svc.price, locale)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveService(svc.id)}
                    aria-label={t("removeService", { name: svc.name })}
                    className="flex size-6 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer before:absolute before:content-[''] relative before:-inset-2"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* فاصل ناعم */}
      <div className="border-t border-border my-2 shrink-0" />

      {/* مؤشر الوقت المقدر */}
      <div className="my-2 flex items-center justify-between rounded-xl border border-warning-bg bg-warning-bg/70 px-3 py-2.5 text-xs text-warning-fg font-medium shrink-0">
        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-warning shrink-0" />
          <span>{t("estimatedDuration")}</span>
        </div>
        <span className="tabular font-bold">
          {totalMinutes > 0 ? t("durationMinutes", { count: totalMinutes }) : "—"}
        </span>
      </div>

      {/* الإجمالي الكلي */}
      <div className="my-4 flex items-baseline justify-between shrink-0">
        <span className="text-sm font-bold text-muted-foreground">{t("total")}</span>
        <span className="tabular text-2xl font-black text-foreground">
          {formatPrice(totalPrice, locale)}
        </span>
      </div>

      {/* زر دخول الطابور */}
      {bookUrl ? (
        <Link
          href={bookUrl}
          className="flex h-12 w-full items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary-pressed hover:shadow-md cursor-pointer"
        >
          {t("joinQueue")}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="flex h-12 w-full items-center justify-center rounded-xl bg-disabled-bg text-xs font-bold text-disabled-fg cursor-not-allowed select-none"
        >
          {selectionCount(0, locale)}
        </button>
      )}
    </div>
  );
}
