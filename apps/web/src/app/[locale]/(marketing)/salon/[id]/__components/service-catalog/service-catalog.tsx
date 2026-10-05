"use client";
// كتالوج الخدمات — صفوف فسيحة بزرار دائري (+) و (✓) فريم ٢١
import { Plus, Check, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { formatPrice } from "@/lib/utils/format/price.utils";
import {
  SERVICE_CATEGORY_ORDER,
  type ServiceCategory,
} from "@/lib/types/service/service.interface";
import type { Service } from "@/lib/types/service/service.interface";

type ServiceCatalogProps = {
  services: Service[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function ServiceCatalog({ services, selectedIds, onToggle }: ServiceCatalogProps) {
  const t = useTranslations("marketing.salon.services");
  const locale = useLocale();

  // تجميع الخدمات بالفئة
  const byCategory = SERVICE_CATEGORY_ORDER.reduce<Map<ServiceCategory, Service[]>>(
    (acc, cat) => acc.set(cat, []),
    new Map(),
  );
  for (const svc of services) {
    byCategory.get(svc.category)?.push(svc);
  }

  return (
    <section id="services" className="scroll-mt-28 px-4 sm:px-8 lg:rounded-[14px] lg:border lg:border-border lg:bg-background lg:p-6 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-base font-bold text-foreground">{t("title")}</h2>

      <div className="flex flex-col">
        {[...byCategory.entries()]
          .filter(([, list]) => list.length > 0)
          .map(([category, list], groupIndex) => (
            <div key={category} className={groupIndex > 0 ? "mt-4.5" : ""}>
              <h3 className="mb-1 px-1 text-[13px] font-bold text-muted-foreground">{category}</h3>

              <div>
                {list.map((svc, i) => {
                  const isSelected = selectedIds.includes(svc.id);

                  return (
                    <div
                      key={svc.id}
                      onClick={() => onToggle(svc.id)}
                      className={`flex cursor-pointer items-center justify-between py-3.5 ${
                        i < list.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-[14.5px] font-bold text-foreground">{svc.name}</span>
                        <span className="mt-0.75 flex items-center gap-1.25 text-xs text-muted-foreground">
                          <Clock className="size-3 text-muted-foreground shrink-0" />
                          <span>{t("durationMinutes", { count: svc.durationMinutes })}</span>
                          {svc.note ? ` · ${svc.note}` : null}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="tabular text-[15px] font-extrabold text-foreground">
                          {formatPrice(svc.price, locale)}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggle(svc.id);
                          }}
                          aria-label={isSelected ? t("deselectService", { name: svc.name }) : t("selectService", { name: svc.name })}
                          className={`relative flex size-8.5 shrink-0 items-center justify-center rounded-[9px] border-[1.5px] border-primary transition-colors cursor-pointer before:absolute before:-inset-2.5 ${
                            isSelected ? "bg-primary text-primary-foreground" : "bg-background text-primary"
                          }`}
                        >
                          {isSelected ? (
                            <Check className="size-4.5" strokeWidth={3} />
                          ) : (
                            <Plus className="size-4.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
      </div>
    </section>
  );
}
