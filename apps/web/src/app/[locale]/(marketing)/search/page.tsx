// البحث والفلاتر — من غير بحث بنعرض آخر ما بحثت عنه، ومع بحث بنعرض النتايج أو حالة «مفيش صالون»
import { SlidersHorizontal } from "lucide-react";
import { PageContainer } from "@/components/atoms/page-container";
import { Link } from "@/i18n/navigation";
import { areas } from "@/lib/data/areas.constants";
import { METADATA_SEARCH } from "@/lib/data/constants/metadata.constants";
import { ROUTE_SEARCH } from "@/lib/data/constants/routes.constants";
import { shops } from "@/lib/data/shops.constants";
import { ShopSort } from "@/lib/types/shop/shop-filters.interface";
import { filterShops } from "@/lib/utils/filter-shops.utils";
import { isToday } from "@/lib/utils/format/date.utils";
import { formatDistance, formatPrice } from "@/lib/utils/format/price.utils";
import { ActiveFiltersBar, type ActiveFilter } from "./__components/active-filters-bar";
import { DateStrip } from "./__components/date-strip";
import { FilterRail } from "./__components/filter-rail";
import { FilterSheet } from "./__components/filter-sheet";
import { NearbyNow } from "./__components/nearby-now";
import { NoResults } from "./__components/no-results";
import { QuickSearch } from "./__components/quick-search";
import { RecentSearches, type RecentSearch } from "./__components/recent-searches";
import { ResultRow } from "./__components/results-list";
import { ResultsGrid } from "./__components/results-grid";
import { SearchBar } from "./__components/search-bar";
import { Suggestions } from "./__components/suggestions";
import { cn } from "@/lib/utils/cn.utils";
import { chipVariants } from "@/components/atoms/chip";

export const metadata = METADATA_SEARCH;

const DEFAULT_AREA = "المعادي";

/** آخر ما بحثت عنه — لسه محلي لحد ما يبقى في حساب */
const RECENT: RecentSearch[] = [
  { id: "r1", query: "بربر لاونج", note: "بحثت عنه امبارح", thumbnail: "/dummy_salon/2.png" },
  { id: "r2", query: "قص شعر ودقن · المعادي", note: "بحثت عنه الأحد" },
  {
    id: "r3",
    query: "صالون الكابتن حسام",
    note: "حجزت هنا مرتين",
    thumbnail: "/dummy_salon/1.png",
  },
  { id: "r4", query: "الزمالك", note: "بحثت عنه الأسبوع اللي فات" },
];

type SearchPageParams = {
  q?: string;
  sort?: string;
  service?: string | string[];
  maxPrice?: string;
  maxDistanceKm?: string;
  todayOnly?: string;
  view?: string;
};

const SORT_VALUES = new Set<string>(Object.values(ShopSort));

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchPageParams>;
}) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";

  // خدمات وأسعار الفلتر بتتحسب من بيانات المحلات الحقيقية — مش من رقم ثابت
  const allShopsForQuery = query ? filterShops(shops, { q: query }) : [];

  // اقتراحات «يمكن تكون بتقصد» — مطابقة أوسع بكلمة واحدة، عشان لو مفيش نتايج للنص كامل
  const suggestions = query
    ? [...new Set(query.split(/\s+/).filter(Boolean).flatMap((word) => filterShops(shops, { q: word })))].slice(0, 3)
    : [];

  const priceSource = allShopsForQuery.length > 0 ? allShopsForQuery : shops;
  const serviceCounts = new Map<string, number>();
  for (const shop of allShopsForQuery) {
    for (const service of shop.services) {
      serviceCounts.set(service, (serviceCounts.get(service) ?? 0) + 1);
    }
  }
  const serviceOptions = [...serviceCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  // لو مفيش نتايج للفلتر الحالي، حدود السعر والمسافة بترجع لكل البيانات بدل 0/0
  const priceValues = priceSource.map((s) => s.priceFrom);
  const priceBounds = { min: Math.min(...priceValues), max: Math.max(...priceValues) };
  const distanceValues = priceSource.map((s) => s.distanceKm);
  const maxAvailableDistance = Math.max(...distanceValues);

  const services = Array.isArray(params.service)
    ? params.service
    : params.service
      ? [params.service]
      : [];
  const sort = params.sort && SORT_VALUES.has(params.sort) ? params.sort : ShopSort.NEXT_SLOT;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : priceBounds.max;
  const maxDistanceKm = params.maxDistanceKm ? Number(params.maxDistanceKm) : 5;
  const todayOnly = params.todayOnly === "true";
  const listView = params.view === "list";

  const results = query
    ? filterShops(shops, {
        q: query,
        services,
        maxPrice: params.maxPrice ? maxPrice : undefined,
        maxDistanceKm: params.maxDistanceKm ? maxDistanceKm : undefined,
        todayOnly,
        sort: sort as ShopSort,
      })
    : [];

  // شرايح الفلاتر المفعّلة — كل واحدة بترجع لينك بيشيلها هي بس
  const keep = (omit: string) => {
    const next = new URLSearchParams();
    next.set("q", query);
    for (const s of services) if (omit !== `service:${s}`) next.append("service", s);
    if (params.maxPrice && omit !== "maxPrice") next.set("maxPrice", params.maxPrice);
    if (params.maxDistanceKm && omit !== "maxDistanceKm") next.set("maxDistanceKm", params.maxDistanceKm);
    if (todayOnly && omit !== "todayOnly") next.set("todayOnly", "true");
    if (params.sort && omit !== "sort") next.set("sort", params.sort);
    return `${ROUTE_SEARCH}?${next}`;
  };

  const activeFilters: ActiveFilter[] = [
    ...services.map((s) => ({ key: `service:${s}`, label: s, clearHref: keep(`service:${s}`) })),
    ...(params.maxPrice
      ? [{ key: "maxPrice", label: `حتى ${formatPrice(maxPrice)}`, clearHref: keep("maxPrice") }]
      : []),
    ...(params.maxDistanceKm
      ? [
          {
            key: "maxDistanceKm",
            label: `لحد ${formatDistance(maxDistanceKm)}`,
            clearHref: keep("maxDistanceKm"),
          },
        ]
      : []),
    ...(todayOnly
      ? [{ key: "todayOnly", label: "فيه ميعاد النهارده", clearHref: keep("todayOnly") }]
      : []),
  ];

  // عدد الصالونات اللي فيها ميعاد النهارده لكل منطقة — بيتعرض على كارت المنطقة
  const availableToday = shops.reduce<Record<string, number>>((acc, shop) => {
    if (shop.nextSlotAt && isToday(shop.nextSlotAt)) {
      acc[shop.areaId] = (acc[shop.areaId] ?? 0) + 1;
    }
    return acc;
  }, {});

  const nearbyNow = shops.filter((s) => s.nextSlotAt && isToday(s.nextSlotAt)).slice(0, 4);

  return (
    <div className="flex flex-col">
      {/* الشريط التاني: البحث الحقيقي + تبديل العرض — الشريط العلوي فيه الهيدر المشترك بس */}
      <div className="sticky top-[60px] z-30 border-b border-border bg-background">
        <PageContainer className="flex items-center gap-2.5 py-3.5 sm:gap-4">
          <SearchBar key={query} autoFocus={!query} className="max-w-[480px] flex-1" />
          {query && (
            <div className="flex shrink-0 overflow-hidden rounded-[9px] border border-border" role="tablist">
              <Link
                href={`${ROUTE_SEARCH}?q=${encodeURIComponent(query)}`}
                role="tab"
                aria-selected={!listView}
                className={cn(
                  "px-3 py-2 text-[12px] font-bold",
                  !listView ? "bg-foreground text-background" : "bg-card text-muted-foreground",
                )}
              >
                تذاكر
              </Link>
              <Link
                href={`${ROUTE_SEARCH}?q=${encodeURIComponent(query)}&view=list`}
                role="tab"
                aria-selected={listView}
                className={cn(
                  "px-3 py-2 text-[12px] font-bold",
                  listView ? "bg-foreground text-background" : "bg-card text-muted-foreground",
                )}
              >
                قائمة
              </Link>
            </div>
          )}
          {query && (
            <FilterSheet
              q={query}
              sort={sort}
              services={services}
              serviceOptions={serviceOptions}
              maxPrice={maxPrice}
              priceBounds={priceBounds}
              maxDistanceKm={maxDistanceKm}
              todayOnly={todayOnly}
              activeCount={activeFilters.length}
              resultCount={results.length}
            />
          )}
        </PageContainer>
      </div>

      <PageContainer className="flex flex-col gap-5 py-6">
        <DateStrip />

        {query ? (
          results.length === 0 ? (
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
              <div className="hidden lg:block lg:w-[300px] lg:shrink-0 lg:opacity-60">
                <FilterRail
                  q={query}
                  sort={sort}
                  services={services}
                  serviceOptions={serviceOptions}
                  maxPrice={maxPrice}
                  priceBounds={priceBounds}
                  maxDistanceKm={maxDistanceKm}
                  todayOnly={todayOnly}
                  activeCount={activeFilters.length}
                  resultCount={0}
                />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-8">
                <div className="flex justify-center lg:hidden">
                  <FilterSheet
                    q={query}
                    sort={sort}
                    services={services}
                    serviceOptions={serviceOptions}
                    maxPrice={maxPrice}
                    priceBounds={priceBounds}
                    maxDistanceKm={maxDistanceKm}
                    todayOnly={todayOnly}
                    activeCount={activeFilters.length}
                    resultCount={0}
                    trigger={
                      <span className="inline-flex h-11 items-center gap-2 rounded-[11px] border border-border bg-card px-5 text-[14px] font-bold text-foreground shadow-xs transition-colors hover:bg-muted cursor-pointer">
                        <SlidersHorizontal className="size-4 text-primary" />
                        <span>تعديل الفلاتر والترتيب</span>
                        {activeFilters.length > 0 && (
                          <span className="tabular rounded-[6px] bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                            {activeFilters.length} مفعّلة
                          </span>
                        )}
                      </span>
                    }
                  />
                </div>
                <NoResults
                  query={query}
                  areaName={DEFAULT_AREA}
                  maxDistanceKm={params.maxDistanceKm ? maxDistanceKm : undefined}
                  maxPrice={params.maxPrice ? maxPrice : undefined}
                  hasFilters={activeFilters.length > 0}
                />
                <Suggestions shops={suggestions} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
              {/* رف الفلاتر الثابت على الديسكتوب فقط */}
              <div className="hidden lg:block lg:sticky lg:top-[132px] lg:w-[300px] lg:shrink-0">
                <FilterRail
                  q={query}
                  sort={sort}
                  services={services}
                  serviceOptions={serviceOptions}
                  maxPrice={maxPrice}
                  priceBounds={priceBounds}
                  maxDistanceKm={maxDistanceKm}
                  todayOnly={todayOnly}
                  activeCount={activeFilters.length}
                  resultCount={results.length}
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <h1 className="tabular text-[21px] font-bold">
                      {results.length} صالونات فيها «{query}»
                    </h1>
                    <p className="text-[13px] text-muted-foreground">
                      في {DEFAULT_AREA} وحواليها · لحد {formatDistance(maxDistanceKm)}
                    </p>
                  </div>
                  <div className="lg:hidden">
                    <FilterSheet
                      q={query}
                      sort={sort}
                      services={services}
                      serviceOptions={serviceOptions}
                      maxPrice={maxPrice}
                      priceBounds={priceBounds}
                      maxDistanceKm={maxDistanceKm}
                      todayOnly={todayOnly}
                      activeCount={activeFilters.length}
                      resultCount={results.length}
                      trigger={
                        <span className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-border bg-card px-3.5 text-[13px] font-bold text-foreground shadow-xs transition-colors hover:bg-muted cursor-pointer">
                          <SlidersHorizontal className="size-3.5 text-primary" />
                          <span>الفلاتر والترتيب</span>
                          {activeFilters.length > 0 && (
                            <span className="tabular rounded-[6px] bg-primary px-1.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                              {activeFilters.length}
                            </span>
                          )}
                        </span>
                      }
                    />
                  </div>
                </header>

                <ActiveFiltersBar q={query} filters={activeFilters} />

                {listView ? (
                  <ul className="flex flex-col gap-3">
                    {results.map((shop, i) => (
                      <li key={shop.id}>
                        <ResultRow shop={shop} status={{ delayMinutes: i % 3 === 2 ? 10 : 0, queueNumber: (i % 4) + 2 }} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ResultsGrid shops={results} />
                )}

                {maxAvailableDistance > maxDistanceKm && (
                  <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-border bg-muted p-4.5 text-center sm:flex-row sm:justify-between sm:text-start">
                    <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                      دي كل النتايج على الفلاتر الحالية. لو وسّعت المسافة لـ{" "}
                      {formatDistance(maxAvailableDistance)} هتلاقي صالونات زيادة.
                    </p>
                    <Link
                      href={keep("maxDistanceKm")}
                      className={cn(chipVariants(), "shrink-0")}
                    >
                      وسّع لـ {formatDistance(maxAvailableDistance)}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <>
            <RecentSearches items={RECENT} />
            <QuickSearch areas={areas.slice(0, 4)} availableToday={availableToday} />
            <NearbyNow shops={nearbyNow} />
          </>
        )}
      </PageContainer>
    </div>
  );
}
