// البحث (فريم 12–15) على صالونات المنطقة المختارة، على الجهاز (زي SearchBloc في Flutter): مفيش شاشة فاضية قبل الكتابة
// (آخر بحث + القريب بأقل انتظار)، الفلاتر المتطبقة chips بتتشال واحدة واحدة، ومفيش نتايج = السبب المرجّح + أفعال حقيقية.
// "شوف الكل" في الرئيسية بيبعت sort و open.
import { useLocalSearchParams } from "expo-router";
import { useState, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { SalonRowSkeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { Chip, ChipRail } from "@/components/molecules/chip";
import { EmptyState } from "@/components/molecules/empty-state";
import { IconButton } from "@/components/molecules/icon-button";
import { OfflineBar } from "@/components/molecules/notice";
import { SearchField } from "@/components/molecules/text-field";
import { SectionDivider } from "@/components/molecules/top-bar";
import { NoConnection } from "@/components/organs/no-connection";
import { SalonListItem } from "@/components/organs/salon-card";
import { useAreas, useCatalog, useSelectedArea } from "@/lib/hooks/salons";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { SalonSummary } from "@/lib/types/salon";
import { dayMs } from "@/lib/utils/day-keys";
import { recentSearches, useRecentSearches } from "@/lib/utils/recent-searches";
import {
  activeFilterCount,
  applyCriteria,
  EMPTY_CRITERIA,
  EXPANDED_RADIUS_KM,
  hasPriceFilter,
  PRICE_CEILING,
  PRICE_FLOOR,
  priceFor,
  suggestions,
  withoutFilters,
  type SearchCriteria,
} from "@/lib/utils/salons/salon-matcher";
import type { SalonSort } from "@/lib/utils/salons/salon-sort.utils";
import { colors } from "@/styles/tokens";
import { FilterSheet, SORTS } from "./__sections/filter-sheet";

const fromParams = (sort?: string, open?: string): SearchCriteria => ({ ...EMPTY_CRITERIA, sort: SORTS.includes(sort as SalonSort) ? (sort as SalonSort) : null, openNowOnly: open === "1" });

/** الفلاتر المتطبقة كـ chips بتتشال (فريم 13) */
function AppliedFilters({ c, onChange }: { c: SearchCriteria; onChange: (next: SearchCriteria) => void }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const chip = (key: string, label: string, next: Partial<SearchCriteria>) => <Chip key={key} label={label} kind="lead" onRemove={() => onChange({ ...c, ...next })} />;
  const dayLabel = (d: string) => {
    const days = Math.round((dayMs(d) - new Date().setHours(12, 0, 0, 0)) / 86_400_000);
    return days === 0 ? t("booking.slot.today") : days === 1 ? t("booking.slot.tomorrow") : f.weekday(new Date(dayMs(d)).toISOString());
  };
  return (
    <ChipRail>
      {c.sort && chip("sort", t(`sort.${c.sort}`), { sort: null })}
      {c.services.map((k) => chip(k, t(`search.services.${k}`), { services: c.services.filter((x) => x !== k) }))}
      {c.day && chip("day", t("search.dayChip", { day: dayLabel(c.day), date: f.number(new Date(dayMs(c.day)).getDate()) }), { day: null })}
      {hasPriceFilter(c) && chip("price", t("search.priceRange", { min: f.number(c.minPrice), max: f.price(c.maxPrice) }), { minPrice: PRICE_FLOOR, maxPrice: PRICE_CEILING })}
      {c.openNowOnly && chip("open", t("search.openNow"), { openNowOnly: false })}
      <Chip label={t("search.clearAll")} onPress={() => onChange(withoutFilters(c))} />
    </ChipRail>
  );
}

function SalonList({ salons, now, live, price }: { salons: SalonSummary[]; now: number; live: boolean; price?: (s: SalonSummary) => { label: string; amount: number } }) {
  return salons.map((s, i) => <SalonListItem key={s.id} salon={s} now={now} live={live} divider={i < salons.length - 1} price={price?.(s)} />);
}

export default function SearchScreen() {
  const t = useTranslations("mobile");
  const f = useFormat();
  const { gutter, listMaxWidth } = useResponsive();
  const online = useOnline();
  const params = useLocalSearchParams<{ sort?: string; open?: string }>();
  const areaId = useSelectedArea();
  const area = useAreas().data?.find((a) => a.id === areaId);
  const catalog = useCatalog(areaId);
  const recent = useRecentSearches();
  const [criteria, setCriteria] = useState(() => fromParams(params.sort, params.open));
  const [filtersOpen, setFiltersOpen] = useState(false);
  // التاب بيفضل mounted: "شوف الكل" جديد = params جديدة (adjust state during render)
  const [seen, setSeen] = useState(`${params.sort}|${params.open}`);
  if (seen !== `${params.sort}|${params.open}`) {
    setSeen(`${params.sort}|${params.open}`);
    setCriteria({ ...fromParams(params.sort, params.open), query: criteria.query });
  }

  const salons = catalog.data;
  const now = catalog.dataUpdatedAt;
  const query = criteria.query.trim();
  const count = activeFilterCount(criteria);
  const setQuery = (q: string) => setCriteria((c) => ({ ...c, query: q }));
  const pick = (q: string) => {
    setQuery(q);
    recentSearches.add(q);
  };
  const pad = { paddingHorizontal: gutter };

  let body: ReactNode;
  if (!salons) {
    body = catalog.isError ? (
      online ? (
        <EmptyState illustration="search_no_results" illustrationWidth={170} title={t("home.loadErrorTitle")}>
          <Button label={t("offline.retry")} icon="refresh" onPress={() => void catalog.refetch()} />
        </EmptyState>
      ) : (
        <NoConnection onRetry={() => void catalog.refetch()} retrying={catalog.isFetching} />
      )
    ) : (
      <View style={[styles.skeleton, pad]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <SalonRowSkeleton />
        <SalonRowSkeleton />
      </View>
    );
  } else if ((!query && !count) || !online) {
    // فريم 12: آخر بحث + القريب دلوقتي بأقل انتظار
    body = (
      <>
        {recent.length > 0 && online && (
          <>
            <View style={[styles.recent, pad]}>
              <View style={styles.rowBetween}>
                <Text variant="sectionTitle" accessibilityRole="header">
                  {t("search.recent")}
                </Text>
                <LinkButton label={t("search.clearAll")} color={colors.textSecondary} onPress={recentSearches.clear} />
              </View>
              <View style={styles.wrap}>
                {recent.map((q) => (
                  <Chip key={q} label={q} height={34} onPress={() => pick(q)} onRemove={() => recentSearches.remove(q)} />
                ))}
              </View>
            </View>
            <SectionDivider />
          </>
        )}
        <View style={pad}>
          <View style={[styles.rowBetween, styles.sectionHead, !(recent.length > 0 && online) && styles.sectionTop]}>
            <Text variant="sectionTitle" accessibilityRole="header">
              {t("search.nearbyNow")}
            </Text>
            <Text dense variant="caption">
              {area?.name ?? ""}
            </Text>
          </View>
          <SalonList salons={applyCriteria(salons, { ...EMPTY_CRITERIA, sort: "leastWait" })} now={now} live={online} />
        </View>
      </>
    );
  } else {
    const results = applyCriteria(salons, criteria);
    const service = criteria.services.length === 1 ? criteria.services[0] : null;
    if (results.length) {
      body = (
        <View style={[pad, styles.results]}>
          <View style={styles.rowBetween}>
            <Text dense variant="caption" weight="semibold" style={styles.shrink}>
              {query
                ? t("search.resultsForQuery", { count: results.length, n: f.count(results.length), query })
                : t("search.resultsCount", { count: results.length, n: f.count(results.length) })}
            </Text>
            <Text dense variant="caption">
              {t("search.withinKm", { n: f.number(criteria.radiusKm) })}
            </Text>
          </View>
          <SalonList salons={results} now={now} live price={service ? (s) => ({ label: t(`search.services.${service}`), amount: priceFor(s, service) }) : undefined} />
        </View>
      );
    } else {
      // فريم 15: السبب المرجّح وأفعال حقيقية
      const similar = suggestions(salons, query);
      body = (
        <>
          <EmptyState
            illustration="search_no_results"
            illustrationWidth={180}
            title={query ? t("search.noResultsTitle") : t("search.noFilterResultsTitle")}
            message={query ? t("search.noResultsBody", { query, area: area?.name ?? "" }) : t("search.noFilterResultsBody")}
          >
            {count > 0 && <Button label={t("search.clearFiltersShowAll")} size="md" onPress={() => setCriteria(withoutFilters(criteria))} />}
            {criteria.radiusKm < EXPANDED_RADIUS_KM && (
              <Button label={t("search.expandRadius", { n: f.number(EXPANDED_RADIUS_KM) })} variant="secondary" size="md" onPress={() => setCriteria({ ...criteria, radiusKm: EXPANDED_RADIUS_KM })} />
            )}
          </EmptyState>
          {similar.length > 0 && (
            <View style={pad}>
              <Text variant="sectionTitle" accessibilityRole="header" style={styles.sectionHead}>
                {t("search.didYouMean")}
              </Text>
              <View style={styles.wrap}>
                {similar.map((s) => (
                  <Chip key={s.id} label={s.name} onPress={() => pick(s.name)} />
                ))}
              </View>
            </View>
          )}
        </>
      );
    }
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {salons && !online && <OfflineBar updatedAt={f.time(new Date(now).toISOString())} onRetry={() => void catalog.refetch()} />}
      <View style={[styles.content, { maxWidth: listMaxWidth }]}>
        <View style={[styles.bar, pad]}>
          <View style={styles.flex}>
            <SearchField
              value={criteria.query}
              onChangeText={setQuery}
              onSubmitEditing={() => recentSearches.add(criteria.query)}
              placeholder={online ? t("search.hint") : t("offline.searchDisabled")}
              locked={!online}
            />
          </View>
          <IconButton
            icon="filter"
            size={48}
            variant={count ? "active" : "outline"}
            count={count}
            accessibilityLabel={t("search.filter")}
            onPress={online && salons ? () => setFiltersOpen(true) : undefined}
          />
        </View>
        {count > 0 && (
          <View style={styles.applied}>
            <AppliedFilters c={criteria} onChange={setCriteria} />
          </View>
        )}
      </View>
      <ScrollView keyboardDismissMode="on-drag" keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.scroll, { maxWidth: listMaxWidth }]}>
        {body}
      </ScrollView>
      {filtersOpen && salons && (
        <FilterSheet
          initial={criteria}
          countFor={(draft) => applyCriteria(salons, draft).length}
          onApply={(next) => {
            setCriteria(next);
            setFiltersOpen(false);
          }}
          onClose={() => setFiltersOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  content: { width: "100%", alignSelf: "center" },
  scroll: { flexGrow: 1, width: "100%", alignSelf: "center", paddingBottom: 22 },
  bar: { flexDirection: "row", alignItems: "center", gap: 10, paddingTop: 8 },
  applied: { marginTop: 12 },
  skeleton: { paddingTop: 4 },
  recent: { paddingTop: 20 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  sectionHead: { marginBottom: 12 },
  sectionTop: { marginTop: 20 },
  results: { paddingTop: 16 },
});
