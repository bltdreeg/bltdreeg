"use client";

// نتايج البحث من /branches — الفلاتر في الـ URL، والترتيب بالمسافة من موقع الزائر (أو الـ IP لحد ما يسمح)
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/button";
import { BranchCard } from "@/components/molecules/branch-card";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useBranchFeed } from "@/lib/hooks/branches";
import { useVisitorPosition } from "@/lib/hooks/geo";
import type { BranchFilters } from "@/lib/types/branch";
import {
  activeBranchFilterCount,
  parseBranchSearchParams,
  toBranchSearchQuery,
} from "@/lib/utils/branches/branch-search-params";
import { BranchFiltersBar } from "../branch-filters-bar";
import { NoResultsIllustration } from "../no-results";
import { SearchSkeleton } from "../search-skeleton";

export function SearchView() {
  const t = useTranslations("marketing.search.feed");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filters = parseBranchSearchParams(params);
  const { position, settled } = useVisitorPosition();
  // بنستنى قرار الموقع (سماح/رفض) قبل أول طلب، زي الرئيسية — عشان الترتيب ميتقلبش قدام العميل
  const feed = useBranchFeed(filters, position, { enabled: settled });

  const setFilters = (next: BranchFilters) => {
    const query = toBranchSearchQuery(next);
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const items = feed.data?.pages.flatMap((page) => page.items) ?? [];
  const total = feed.data?.pages[0]?.total ?? 0;
  const origin = feed.data?.pages[0]?.origin;
  const hasFilters = activeBranchFilterCount(filters) > 0;

  return (
    <div className="flex flex-col gap-5">
      <BranchFiltersBar filters={filters} onChange={setFilters} />

      {feed.isPending ? (
        <SearchSkeleton />
      ) : feed.isError && items.length === 0 ? (
        <div role="alert" className="flex flex-col items-center gap-3 py-16 text-center">
          <p className="text-[15px] font-bold">{t("loadError")}</p>
          <Button type="button" onClick={() => void feed.refetch()} className="h-10 rounded-xl px-6 font-bold">
            {t("retry")}
          </Button>
        </div>
      ) : items.length === 0 ? (
        <section className="flex flex-col items-center gap-5 py-10 text-center">
          <NoResultsIllustration />
          <div className="flex flex-col gap-2">
            <h2 className="text-[21px] font-bold">{t("noResultsTitle")}</h2>
            <p className="max-w-[420px] text-[15px] leading-relaxed text-muted-foreground">
              {filters.q ? t("noResultsQuery", { query: filters.q }) : t("noResultsFilters")}
            </p>
          </div>
          {(hasFilters || filters.q) && (
            <Button
              type="button"
              onClick={() => setFilters({ sort: filters.sort })}
              className="h-12 w-full max-w-[340px] rounded-[10px] text-[15px] font-bold"
            >
              {t("clearAll")}
            </Button>
          )}
        </section>
      ) : (
        <>
          <header className="flex flex-col gap-1">
            <h1 className="tabular text-[21px] font-bold">
              {filters.q ? t("resultsTitle", { count: total, query: filters.q }) : t("allTitle", { count: total })}
            </h1>
            {origin && (
              <p className="text-[13px] text-muted-foreground">
                {t("sortedFrom", { area: origin.city.name })}
              </p>
            )}
          </header>

          <div className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 md:gap-5 ${feed.isPlaceholderData ? "opacity-60" : ""}`}>
            {items.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>

          {feed.hasNextPage && (
            <Button
              type="button"
              variant="outline"
              onClick={() => void feed.fetchNextPage()}
              disabled={feed.isFetchingNextPage}
              className="mx-auto h-11 rounded-xl px-8 font-bold"
            >
              {feed.isFetchingNextPage ? t("loadingMore") : t("loadMore")}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
