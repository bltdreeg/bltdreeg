"use client";

// فلاتر البحث اللي الـ API بيدعمها: الترتيب، أقصى سعر، المحافظة ← المدينة.
// كل تغيير بيكتب في الـ URL (replace) فاللينك قابل للمشاركة وزرار الرجوع مبيتملاش
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { chipVariants } from "@/components/atoms/chip";
import { useCities, useGovernorates } from "@/lib/hooks/geo";
import type { BranchFilters, BranchSort } from "@/lib/types/branch";
import { cn } from "@/lib/utils/cn.utils";
import { formatPrice } from "@/lib/utils/format/price.utils";

const SORTS: { value: BranchSort; key: "nearest" | "price" | "newest" }[] = [
  { value: "nearest", key: "nearest" },
  { value: "price", key: "price" },
  { value: "newest", key: "newest" },
];

const PRICE_STEPS = [50, 100, 200] as const;

const SELECT_CLASS =
  "h-10 w-full appearance-none rounded-[10px] border border-border bg-card ps-3 pe-8 text-[13px] font-semibold text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60";

type BranchFiltersBarProps = {
  filters: BranchFilters;
  onChange: (next: BranchFilters) => void;
};

export function BranchFiltersBar({ filters, onChange }: BranchFiltersBarProps) {
  const t = useTranslations("marketing.search.feed");
  const tSort = useTranslations("marketing.search.sortOptions");
  const locale = useLocale();
  const sort = filters.sort ?? "nearest";

  // القوائم بتتحمّل أول ما العميل يفتحها (أو لو فيه محافظة مختارة من الـ URL)
  const [governoratesRequested, setGovernoratesRequested] = useState(!!filters.governorateId);
  const governorates = useGovernorates(governoratesRequested);
  const cities = useCities(filters.governorateId ?? null);

  return (
    <div className="flex flex-col gap-3">
      <div role="radiogroup" aria-label={t("sortLabel")} className="flex flex-wrap gap-2">
        {SORTS.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={sort === option.value}
            onClick={() => onChange({ ...filters, sort: option.value })}
            className={cn(chipVariants(), sort === option.value && "border-primary bg-primary text-primary-foreground hover:bg-primary")}
          >
            {tSort(option.key)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        <label className="relative flex flex-col gap-1 text-[12px] font-bold text-muted-foreground">
          {t("price")}
          <select
            value={filters.maxPrice ?? ""}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className={SELECT_CLASS}
          >
            <option value="">{t("anyPrice")}</option>
            {PRICE_STEPS.map((price) => (
              <option key={price} value={price}>
                {t("upToPrice", { price: formatPrice(price, locale) })}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute bottom-3 end-3 size-4" />
        </label>

        <label className="relative flex flex-col gap-1 text-[12px] font-bold text-muted-foreground">
          {t("governorate")}
          <select
            value={filters.governorateId ?? ""}
            onFocus={() => setGovernoratesRequested(true)}
            onPointerDown={() => setGovernoratesRequested(true)}
            onChange={(e) => onChange({ ...filters, governorateId: e.target.value || undefined, cityId: undefined })}
            className={SELECT_CLASS}
          >
            <option value="">{t("anyGovernorate")}</option>
            {governorates.data?.map((governorate) => (
              <option key={governorate.id} value={governorate.id}>
                {governorate.name}
              </option>
            ))}
            {/* قبل ما القائمة تتحمّل: نعرض المختار من الـ URL عشان القيمة متتمسحش */}
            {!governorates.data && filters.governorateId && <option value={filters.governorateId}>…</option>}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute bottom-3 end-3 size-4" />
        </label>

        <label className="relative flex flex-col gap-1 text-[12px] font-bold text-muted-foreground">
          {t("city")}
          <select
            value={filters.cityId ?? ""}
            disabled={!filters.governorateId}
            onChange={(e) => onChange({ ...filters, cityId: e.target.value || undefined })}
            className={SELECT_CLASS}
          >
            <option value="">{t("anyCity")}</option>
            {cities.data?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
            {!cities.data && filters.cityId && <option value={filters.cityId}>…</option>}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute bottom-3 end-3 size-4" />
        </label>
      </div>
    </div>
  );
}
