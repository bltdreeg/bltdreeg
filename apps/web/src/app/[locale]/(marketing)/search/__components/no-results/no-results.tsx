// مفيش نتايج: الرسمة الفيكتورية المخصصة مطابقة للفريم ١٥ في mobile.html والسبب بالظبط بالفلاتر
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/atoms/button";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { cn } from "@/lib/utils/cn.utils";
import { formatDistance, formatPrice } from "@/lib/utils/format/price.utils";

export function NoResultsIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("w-[180px] h-auto select-none", className)}
    >
      {/* عدسة المكبرة */}
      <circle cx="88" cy="74" r="42" fill="#F7F8FA" stroke="#E5E7EB" strokeWidth="3" />
      {/* مقبض المكبرة */}
      <path d="M118 104l26 26" stroke="#6B7280" strokeWidth="7" strokeLinecap="round" />
      {/* أيقونة الصالون داخل العدسة */}
      <g fill="none" stroke="#0F766E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M70 62v28h36V62" />
        <path d="M66 62l4-12h32l4 12" />
        <path d="M82 90V76h12v14" />
      </g>
      {/* شارة الخطأ الدائرية */}
      <circle cx="152" cy="42" r="17" fill="#FDEAEA" />
      {/* علامة الإغلاق / عدم التطابق */}
      <path d="M146 36l12 12M158 36l-12 12" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

type NoResultsProps = {
  /** النص اللي مالقاش نتايج */
  query: string;
  areaName: string;
  /** الفلاتر المفعّلة — بتتضاف لجملة السبب لو موجودة */
  maxDistanceKm?: number;
  maxPrice?: number;
  hasFilters: boolean;
};

function NoResults({ query, areaName, maxDistanceKm, maxPrice, hasFilters }: NoResultsProps) {
  const t = useTranslations("marketing.search.noResults");
  const locale = useLocale();

  const reason = locale === "ar"
    ? [
        `في ${areaName}`,
        maxDistanceKm !== undefined ? `لحد ${formatDistance(maxDistanceKm, locale)}` : null,
        maxPrice !== undefined ? `وبسعر لحد ${formatPrice(maxPrice, locale)}` : null,
      ]
        .filter(Boolean)
        .join(" ")
    : [
        `in ${areaName}`,
        maxDistanceKm !== undefined ? `within ${formatDistance(maxDistanceKm, locale)}` : null,
        maxPrice !== undefined ? `and price up to ${formatPrice(maxPrice, locale)}` : null,
      ]
        .filter(Boolean)
        .join(" ");

  return (
    <section className="flex flex-col items-center gap-5 py-6 text-center">
      <NoResultsIllustration />

      <div className="flex flex-col gap-2">
        <h2 className="text-[21px] font-bold">{t("title")}</h2>
        <p className="max-w-[420px] text-[15px] leading-relaxed text-muted-foreground">
          {t("description", { query, reason })}
        </p>
      </div>

      <div className="flex w-full max-w-[340px] flex-col gap-2.5">
        {hasFilters && (
          <Link
            href={`${ROUTE_SEARCH}?q=${encodeURIComponent(query)}`}
            className="flex h-12 w-full items-center justify-center rounded-[10px] bg-primary text-[15px] font-bold text-primary-foreground shadow-xs transition-colors hover:bg-primary-pressed"
          >
            {t("clearFiltersShowAll")}
          </Link>
        )}
        <Link
          href={`${ROUTE_SEARCH}?q=${encodeURIComponent(query)}&maxDistanceKm=10`}
          className={cn(
            "flex h-12 w-full items-center justify-center rounded-[10px] font-bold transition-colors",
            hasFilters
              ? "border border-border bg-card text-[14.5px] text-foreground hover:bg-muted"
              : "bg-primary text-[15px] text-primary-foreground shadow-xs hover:bg-primary-pressed",
          )}
        >
          {t("expandRange10Km")}
        </Link>
      </div>
    </section>
  );
}

export { NoResults };
