"use client";

// شيت الفلاتر السفلي (Bottom Sheet) لشاشات الموبايل والتابلت بأسلوب الفريم ١٤ في mobile.html
import { Dialog } from "@base-ui/react/dialog";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { shops } from "@/lib/data/shops.constants";
import { ShopSort } from "@/lib/types/shop/shop-filters.interface";
import { cn } from "@/lib/utils/cn.utils";
import { filterShops } from "@/lib/utils/filter-shops.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";

export type FilterSheetProps = {
  q: string;
  sort: string;
  services: string[];
  serviceOptions: { name: string; count: number }[];
  maxPrice: number;
  priceBounds: { min: number; max: number };
  maxDistanceKm: number;
  todayOnly: boolean;
  activeCount: number;
  resultCount?: number;
  className?: string;
  trigger?: React.ReactNode;
};

export function FilterSheet({
  q,
  sort,
  services,
  serviceOptions,
  maxPrice,
  priceBounds,
  maxDistanceKm,
  todayOnly,
  activeCount,
  className,
  trigger,
}: FilterSheetProps) {
  const t = useTranslations("marketing.search.filterSheet");
  const tSort = useTranslations("marketing.search.sortOptions");
  const locale = useLocale();

  const sortOptions: { value: ShopSort; label: string }[] = [
    { value: ShopSort.NEXT_SLOT, label: tSort("nextSlotSheet") },
    { value: ShopSort.NEAREST, label: tSort("nearest") },
    { value: ShopSort.RATING, label: tSort("rating") },
    { value: ShopSort.PRICE, label: tSort("priceSheet") },
    { value: ShopSort.NEWEST, label: tSort("newestSheet") },
  ];

  const router = useRouter();
  const [open, setOpen] = useState(false);

  // حالات الاختيار المؤقتة داخل الشيت (Draft state)
  const [selectedSort, setSelectedSort] = useState<string>(sort);
  const [selectedServices, setSelectedServices] = useState<string[]>(services);
  const [selectedPrice, setSelectedPrice] = useState<number>(maxPrice);
  const [selectedDistance, setSelectedDistance] = useState<number>(maxDistanceKm);
  const [selectedTodayOnly, setSelectedTodayOnly] = useState<boolean>(todayOnly);

  // مزامنة الفلاتر مع الـ URL عند فتح الشيت
  useEffect(() => {
    if (open) {
      setSelectedSort(sort);
      setSelectedServices(services);
      setSelectedPrice(maxPrice);
      setSelectedDistance(maxDistanceKm);
      setSelectedTodayOnly(todayOnly);
    }
  }, [open, sort, services, maxPrice, maxDistanceKm, todayOnly]);

  // حساب عدد الفلاتر المفعّلة المؤقتة داخل الشيت
  const draftActiveCount =
    (selectedSort !== ShopSort.NEXT_SLOT ? 1 : 0) +
    selectedServices.length +
    (selectedPrice < priceBounds.max ? 1 : 0) +
    (selectedDistance !== 5 ? 1 : 0) +
    (selectedTodayOnly ? 1 : 0);

  // حساب عدد النتائج المتوقعة لحظياً أثناء تغيير الفلاتر
  const previewCount = useMemo(() => {
    return filterShops(shops, {
      q,
      services: selectedServices,
      maxPrice: selectedPrice < priceBounds.max ? selectedPrice : undefined,
      maxDistanceKm: selectedDistance !== 5 ? selectedDistance : undefined,
      todayOnly: selectedTodayOnly,
      sort: selectedSort as ShopSort,
    }).length;
  }, [q, selectedServices, selectedPrice, priceBounds.max, selectedDistance, selectedTodayOnly, selectedSort]);

  const handleReset = () => {
    setSelectedSort(ShopSort.NEXT_SLOT);
    setSelectedServices([]);
    setSelectedPrice(priceBounds.max);
    setSelectedDistance(5);
    setSelectedTodayOnly(false);
  };

  const handleApply = () => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (selectedSort && selectedSort !== ShopSort.NEXT_SLOT) next.set("sort", selectedSort);
    for (const s of selectedServices) next.append("service", s);
    if (selectedPrice < priceBounds.max) next.set("maxPrice", String(selectedPrice));
    if (selectedDistance !== 5) next.set("maxDistanceKm", String(selectedDistance));
    if (selectedTodayOnly) next.set("todayOnly", "true");

    setOpen(false);
    router.push(`${ROUTE_SEARCH}?${next.toString()}`);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        className={cn(
          !trigger &&
            "relative flex h-11 items-center gap-2 rounded-[11px] border border-border bg-card px-3 text-[13px] font-bold text-foreground transition-colors hover:bg-muted sm:px-3.5 lg:hidden cursor-pointer",
          !trigger && activeCount > 0 && "border-primary bg-tint text-primary-pressed",
          className,
        )}
      >
        {trigger ?? (
          <>
            <SlidersHorizontal className="size-4 text-primary" />
            <span className="hidden sm:inline">{t("filters")}</span>
            {activeCount > 0 && (
              <span className="tabular flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">
                {activeCount}
              </span>
            )}
          </>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] transition-opacity data-[ending-style]:opacity-0 data-[starting-style]:opacity-0" />
        <Dialog.Popup
          data-slot="filter-bottom-sheet"
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex max-h-[90vh] w-full flex-col rounded-t-[22px] border-t border-border bg-card shadow-2xl transition-transform duration-300 ease-out",
            "data-[ending-style]:translate-y-full data-[starting-style]:translate-y-full",
            "sm:max-w-xl sm:mx-auto",
            "lg:hidden",
          )}
        >
          {/* مقبض السحب العلوي (Grab handle) */}
          <div className="mx-auto mt-3 h-1 w-10 shrink-0 rounded-full bg-border" />

          {/* ترويسة الشيت */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <Dialog.Title className="text-[17px] font-extrabold text-foreground">
                {t("title")}
              </Dialog.Title>
              {draftActiveCount > 0 && (
                <span className="tabular rounded-[7px] bg-primary px-2.5 py-0.5 text-[11.5px] font-bold text-primary-foreground">
                  {t("active", { count: draftActiveCount })}
                </span>
              )}
            </div>
            <Dialog.Close
              aria-label={t("close")}
              className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground cursor-pointer"
            >
              <X className="size-4.5" />
            </Dialog.Close>
          </div>

          {/* محتوى الفلاتر القابل للتمرير */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            {/* ١. ترتيب النتائج بـ */}
            <div>
              <div className="mb-2.5 text-[13.5px] font-bold text-foreground">
                {t("sortBy")}
              </div>
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((opt) => {
                  const isSelected = selectedSort === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedSort(opt.value)}
                      className={cn(
                        "inline-flex h-9 items-center justify-center rounded-full px-4 text-[13px] font-semibold transition-all cursor-pointer",
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold shadow-xs border border-primary"
                          : "border border-border bg-background text-foreground hover:bg-muted/60",
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ٢. الخدمة اللي عايزها */}
            {serviceOptions.length > 0 && (
              <div>
                <div className="mb-2.5 text-[13.5px] font-bold text-foreground">
                  {t("serviceWanted")}
                </div>
                <div className="flex flex-wrap gap-2">
                  {serviceOptions.map((opt) => {
                    const isSelected = selectedServices.includes(opt.name);
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => {
                          setSelectedServices((prev) =>
                            isSelected ? prev.filter((s) => s !== opt.name) : [...prev, opt.name],
                          );
                        }}
                        className={cn(
                          "inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[13px] font-semibold transition-all cursor-pointer",
                          isSelected
                            ? "bg-primary text-primary-foreground font-bold shadow-xs border border-primary"
                            : "border border-border bg-background text-foreground hover:bg-muted/60",
                        )}
                      >
                        {isSelected && <Check className="size-3.5 stroke-[2.5]" />}
                        <span>{opt.name}</span>
                        <span
                          className={cn(
                            "tabular text-[11.5px]",
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground",
                          )}
                        >
                          ({opt.count})
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ٣. السعر */}
            <div>
              <div className="mb-2 flex items-center justify-between text-[13.5px] font-bold">
                <span className="text-foreground">{t("price")}</span>
                <span className="tabular text-primary-pressed">
                  {t("upToPrice", { price: formatPrice(selectedPrice, locale) })}
                </span>
              </div>
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(Number(e.target.value))}
                className="h-2 w-full accent-primary cursor-pointer"
              />
              <div className="mt-1 flex justify-between text-[12px] text-muted-foreground">
                <span className="tabular">{formatPrice(priceBounds.min, locale)}</span>
                <span className="tabular">{formatPrice(priceBounds.max, locale)}</span>
              </div>
            </div>

            {/* ٤. المسافة */}
            <div>
              <div className="mb-2 flex items-center justify-between text-[13.5px] font-bold">
                <span className="text-foreground">{t("distance")}</span>
                <span className="tabular text-muted-foreground">
                  {t("upToDistance", { distance: selectedDistance })}
                </span>
              </div>
              <div className="flex gap-2">
                {[2, 5, 10].map((km) => {
                  const isSelected = selectedDistance === km;
                  return (
                    <button
                      key={km}
                      type="button"
                      onClick={() => setSelectedDistance(km)}
                      className={cn(
                        "flex h-9 flex-1 items-center justify-center rounded-[9px] border text-[13px] font-semibold transition-colors cursor-pointer",
                        isSelected
                          ? "border-primary bg-tint font-bold text-primary-pressed"
                          : "border-border bg-background text-foreground hover:bg-muted/60",
                      )}
                    >
                      {t("km", { km })}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ٥. مفتوح دلوقتي بس */}
            <div className="flex items-center justify-between border-t border-border pt-4">
              <div className="flex flex-col gap-0.5">
                <span className="text-[14px] font-bold text-foreground">{t("openNowOnly")}</span>
                <span className="text-[12px] text-muted-foreground">{t("hideClosed")}</span>
              </div>
              <label className="relative inline-flex h-[26px] w-11 shrink-0 cursor-pointer items-center rounded-full bg-disabled-bg transition-colors has-checked:bg-primary">
                <input
                  type="checkbox"
                  checked={selectedTodayOnly}
                  onChange={(e) => setSelectedTodayOnly(e.target.checked)}
                  className="peer sr-only"
                />
                <span
                  aria-hidden
                  className="ms-0.5 size-5 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5"
                />
              </label>
            </div>
          </div>

          {/* الشريط السفلي الثابت للإجراءات */}
          <div className="sticky bottom-0 z-10 flex items-center gap-2.5 border-t border-border bg-card px-5 py-3.5 pb-6">
            <button
              type="button"
              onClick={handleReset}
              className="h-12 flex-[0_0_110px] rounded-[11px] border border-border bg-background text-[14px] font-bold text-foreground transition-colors hover:bg-muted cursor-pointer"
            >
              {t("resetAll")}
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="h-12 flex-1 rounded-[11px] bg-primary text-[15px] font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-pressed cursor-pointer"
            >
              {previewCount === 0
                ? t("noResults")
                : t("showResults", { count: previewCount })}
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

