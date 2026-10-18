"use client";
// كتالوج الخدمات — صفوف فسيحة بزرار دائري (+) و (✓) فريم ٢١. التصنيفات جاية من الصالون نفسه
import { Plus, Check, Clock } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { formatPrice } from "@/lib/utils/format/price.utils";
import type { BranchServiceCategory } from "@/lib/types/branch";

type ServiceCatalogProps = {
  categories: BranchServiceCategory[];
  selectedIds: string[];
  onToggle: (id: string) => void;
};

export function ServiceCatalog({ categories, selectedIds, onToggle }: ServiceCatalogProps) {
  const t = useTranslations("marketing.salon.services");
  const locale = useLocale();
  const groups = categories.filter((category) => category.services.length > 0);

  return (
    <section id="services" className="scroll-mt-28 px-4 sm:px-8 lg:rounded-[14px] lg:border lg:border-border lg:bg-background lg:p-6 lg:shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
      <h2 className="mb-4 text-base font-bold text-foreground">{t("title")}</h2>

      {groups.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
          {t("empty")}
        </p>
      ) : (
        <div className="flex flex-col">
          {groups.map((category, groupIndex) => (
            <div key={category.id ?? "uncategorized"} className={groupIndex > 0 ? "mt-4.5" : ""}>
              <h3 className="mb-1 px-1 text-[13px] font-bold text-muted-foreground">
                {category.name ?? t("uncategorized")}
              </h3>

              <div>
                {category.services.map((svc, i) => {
                  const isSelected = selectedIds.includes(svc.id);

                  return (
                    <div
                      key={svc.id}
                      onClick={() => onToggle(svc.id)}
                      className={`flex cursor-pointer items-center justify-between gap-3 py-3.5 ${
                        i < category.services.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <div className="flex min-w-0 flex-col">
                        <span className="text-[14.5px] font-bold text-foreground">{svc.name}</span>
                        <span className="mt-0.75 flex items-center gap-1.25 text-xs text-muted-foreground">
                          <Clock className="size-3 text-muted-foreground shrink-0" />
                          <span>{t("durationMinutes", { count: svc.durationMinutes })}</span>
                        </span>
                        {/* بيانات الكتالوج الافتراضية بتكرر الاسم كوصف — منعرضهوش مرتين */}
                        {svc.description && svc.description !== svc.name && (
                          <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{svc.description}</span>
                        )}
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
                          aria-pressed={isSelected}
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
      )}
    </section>
  );
}
