import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";

export type ActiveFilter = {
  key: string;
  label: string;
  /** الرابط بعد شيل الفلتر ده بس */
  clearHref: string;
};

function ActiveFiltersBar({ q, filters }: { q: string; filters: ActiveFilter[] }) {
  const t = useTranslations("marketing.search.activeFilters");

  if (filters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => (
        <Link
          key={f.key}
          href={f.clearHref}
          className={cn(
            "flex h-9 items-center gap-2 rounded-[9px] border border-primary bg-tint px-3.5 pe-2.5 text-[12.5px] font-bold text-primary-pressed transition-colors hover:bg-tint-border",
          )}
        >
          {f.label}
          <span aria-hidden className="flex size-4 items-center justify-center rounded-[5px] bg-primary/15">
            <X className="size-2.5" strokeWidth={2.5} />
          </span>
        </Link>
      ))}
      <Link
        href={`${ROUTE_SEARCH}?q=${encodeURIComponent(q)}`}
        className="ms-1.5 text-[12.5px] font-bold text-primary hover:text-primary-pressed"
      >
        {t("clearAll")}
      </Link>
    </div>
  );
}

export { ActiveFiltersBar };
