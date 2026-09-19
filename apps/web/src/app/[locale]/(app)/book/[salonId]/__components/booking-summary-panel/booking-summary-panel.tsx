import type { ReactNode } from "react";
import { Store, Clock } from "lucide-react";
import type { SalonDetails } from "@/lib/types/salon";
import type { Service } from "@/lib/types/service/service.interface";
import { formatPrice } from "@/lib/utils/format/price.utils";

type BookingSummaryPanelProps = {
  salon: SalonDetails;
  services: Service[];
  /** محتوى إضافي بيتضاف تحت الخدمات (صف الحلاق أو المعاد) */
  children?: ReactNode;
  cta: ReactNode;
};

export function BookingSummaryPanel({ salon, services, children, cta }: BookingSummaryPanelProps) {
  const totalMinutes = services.reduce((n, s) => n + s.durationMinutes, 0);
  const totalPrice = services.reduce((n, s) => n + s.price, 0);

  return (
    <div className="flex flex-col rounded-[14px] border border-border bg-white overflow-hidden lg:sticky lg:top-5">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-secondary text-muted-foreground">
          <Store className="size-5" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[14.5px] font-bold text-foreground">{salon.name}</span>
          <span className="text-xs text-muted-foreground">{salon.areaName}</span>
        </div>
      </div>

      <div className="flex flex-col px-4.5 pt-1.5">
        {services.map((svc) => (
          <div key={svc.id} className="flex items-start justify-between gap-3 border-b border-border py-3 last:border-b-0">
            <div className="flex flex-col gap-0.5">
              <span className="text-[14.5px] font-semibold text-foreground">{svc.name}</span>
              <span className="tabular text-xs text-muted-foreground">{svc.durationMinutes} دقيقة</span>
            </div>
            <span className="tabular shrink-0 text-sm font-bold text-foreground">{formatPrice(svc.price)}</span>
          </div>
        ))}
      </div>

      {children}

      {/* خط التقطيع + الخرمين — التوقيع البصري للتذكرة (FRAME 01 & FRAME 07/08) */}
      <div className="relative mt-2">
        <div className="border-t border-dashed border-perforation" />
        <div className="absolute -top-2 -right-2.25 size-4 rounded-full border border-border bg-white" />
        <div className="absolute -top-2 -left-2.25 size-4 rounded-full border border-border bg-white" />
      </div>

      <div className="flex flex-col gap-2.5 p-4.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13.5px] font-semibold text-muted-foreground">
            <Clock className="size-3.5 text-muted-foreground" />
            <span>المدة الكلية</span>
          </div>
          <span className="tabular text-sm font-bold text-foreground">{totalMinutes} دقيقة</span>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-[15px] font-bold text-foreground">الإجمالي</span>
          <span className="tabular text-[26px] font-extrabold text-foreground">{formatPrice(totalPrice)}</span>
        </div>
        {cta && <div className="mt-1">{cta}</div>}
      </div>
    </div>
  );
}
