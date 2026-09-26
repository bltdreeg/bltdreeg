import { useLocale, useTranslations } from "next-intl";
import { RadioGroup, Radio } from "@/components/atoms/radio";
import { Checkbox } from "@/components/atoms/checkbox";
import { Label } from "@/components/atoms/label";
import { buttonVariants } from "@/components/atoms/button";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { ShopSort } from "@/lib/types/shop/shop-filters.interface";
import { formatPrice } from "@/lib/utils/format/price.utils";
import { cn } from "@/lib/utils/cn.utils";

type ServiceOption = { name: string; count: number };

type FilterRailProps = {
  q: string;
  sort: string;
  services: string[];
  serviceOptions: ServiceOption[];
  maxPrice: number;
  priceBounds: { min: number; max: number };
  maxDistanceKm: number;
  todayOnly: boolean;
  activeCount: number;
  resultCount: number;
};

function FilterRail({
  q,
  sort,
  services,
  serviceOptions,
  maxPrice,
  priceBounds,
  maxDistanceKm,
  todayOnly,
  activeCount,
  resultCount,
}: FilterRailProps) {
  const t = useTranslations("marketing.search.filterRail");
  const tSort = useTranslations("marketing.search.sortOptions");
  const locale = useLocale();

  const sortOptions: { value: string; label: string }[] = [
    { value: ShopSort.NEXT_SLOT, label: tSort("nextSlot") },
    { value: ShopSort.NEAREST, label: tSort("nearest") },
    { value: ShopSort.RATING, label: tSort("rating") },
    { value: ShopSort.PRICE, label: tSort("price") },
    { value: ShopSort.NEWEST, label: tSort("newest") },
  ];

  return (
    <form
      method="get"
      action={ROUTE_SEARCH}
      className="flex flex-col gap-4 rounded-[14px] border border-border bg-card"
    >
      <input type="hidden" name="q" value={q} />

      <div className="flex items-center justify-between gap-2.5 border-b border-border px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-bold">{t("filters")}</span>
          {activeCount > 0 && (
            <span className="tabular rounded-[7px] bg-primary px-2.5 py-1 text-[11.5px] font-bold text-primary-foreground">
              {t("active", { count: activeCount })}
            </span>
          )}
        </div>
        <a href={`${ROUTE_SEARCH}?q=${encodeURIComponent(q)}`} className="text-[12.5px] font-bold text-primary hover:text-primary-pressed">
          {t("clearAll")}
        </a>
      </div>

      <div className="flex flex-col gap-2.5 border-b border-border px-4 pb-4">
        <span className="text-[13px] font-bold">{t("sortResults")}</span>
        <RadioGroup name="sort" defaultValue={sort} className="flex flex-col gap-1">
          {sortOptions.map((opt) => (
            <Label key={opt.value} className="flex cursor-pointer items-center gap-2.5 py-1 text-[13.5px] font-medium">
              <Radio value={opt.value} />
              {opt.label}
            </Label>
          ))}
        </RadioGroup>
      </div>

      {serviceOptions.length > 0 && (
        <div className="flex flex-col gap-2.5 border-b border-border px-4 pb-4">
          <span className="text-[13px] font-bold">{t("service")}</span>
          <div className="flex flex-col gap-1">
            {serviceOptions.map((opt) => (
              <Label key={opt.name} className="flex cursor-pointer items-center gap-2.5 py-1 text-[13.5px]">
                <Checkbox name="service" value={opt.name} defaultChecked={services.includes(opt.name)} />
                <span className="flex-1">{opt.name}</span>
                <span className="tabular text-[12.5px] text-muted-foreground">{opt.count}</span>
              </Label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5 border-b border-border px-4 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold">{t("price")}</span>
          <span className="tabular text-[13px] font-bold text-primary-pressed">
            {t("upToPrice", { price: formatPrice(maxPrice, locale) })}
          </span>
        </div>
        <input
          type="range"
          name="maxPrice"
          min={priceBounds.min}
          max={priceBounds.max}
          defaultValue={maxPrice}
          className="h-1.5 w-full accent-primary"
        />
        <div className="flex justify-between text-[11.5px] text-muted-foreground">
          <span className="tabular">{formatPrice(priceBounds.min, locale)}</span>
          <span className="tabular">{formatPrice(priceBounds.max, locale)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 border-b border-border px-4 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-bold">{t("distance")}</span>
          <span className="tabular text-[13px] font-bold text-muted-foreground">
            {t("upToDistance", { km: maxDistanceKm })}
          </span>
        </div>
        <div className="flex gap-1.5">
          {[2, 5, 10].map((km) => (
            <Label
              key={km}
              className={cn(
                "flex h-9 flex-1 cursor-pointer items-center justify-center rounded-[9px] border text-[12.5px] font-semibold has-checked:border-primary has-checked:bg-tint has-checked:font-bold has-checked:text-primary-pressed",
                "border-border",
              )}
            >
              <input
                type="radio"
                name="maxDistanceKm"
                value={km}
                defaultChecked={maxDistanceKm === km}
                className="sr-only"
              />
              {t("km", { km })}
            </Label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pb-4">
        <span className="text-[13.5px] font-semibold">{t("openTodayOnly")}</span>
        <label className="relative inline-flex h-[26px] w-11 shrink-0 cursor-pointer items-center rounded-full bg-disabled-bg transition-colors has-checked:bg-primary">
          <input type="checkbox" name="todayOnly" value="true" defaultChecked={todayOnly} className="peer sr-only" />
          <span
            aria-hidden
            className="ms-0.5 size-5 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5"
          />
        </label>
      </div>

      <button
        type="submit"
        className={cn(buttonVariants(), "mx-4 mb-4 h-11 rounded-[10px] text-[14.5px] font-bold")}
      >
        {t("showResults", { count: resultCount })}
      </button>
    </form>
  );
}

export { FilterRail };
