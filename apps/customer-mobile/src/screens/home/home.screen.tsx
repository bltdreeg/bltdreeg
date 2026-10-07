// الرئيسية (فريم 07، 08، 18، 40): الصالونات القريبة من المنطقة المختارة — حالة الانتظار قبل التقييم.
// من غير بيانات: skeleton / خطأ / "النت فاصل" كاملة. ببيانات ومن غير نت: شريط علوي والأرقام الحية مستخبية.
import { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Button } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { OfflineBar } from "@/components/molecules/notice";
import { NoConnection } from "@/components/organs/no-connection";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { useAreas, useCatalog, useSelectedArea } from "@/lib/hooks/salons";
import type { SalonSort } from "@/lib/utils/salons/salon-sort.utils";
import { colors } from "@/styles/tokens";
import { AreaSheet } from "@/components/organs/area-sheet";
import { HomeLive, HomeOffline } from "./__sections/home-body";
import { HomeHeader } from "./__sections/home-header";
import { HomeSkeleton } from "./__sections/home-skeleton";

export default function HomeScreen() {
  const t = useTranslations("mobile.home");
  const tOffline = useTranslations("mobile.offline");
  const f = useFormat();
  const { gutter, listMaxWidth } = useResponsive();
  const online = useOnline();
  const areaId = useSelectedArea();
  const areas = useAreas().data ?? [];
  const catalog = useCatalog(areaId);
  const [sort, setSort] = useState<SalonSort>("leastWait");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [pulling, setPulling] = useState(false);

  const area = areas.find((a) => a.id === areaId);
  const salons = catalog.data;
  // "دلوقتي" بتاع الليبلز = وقت آخر تحديث للبيانات (بيفتح النهارده/بكرة، فتح من أسبوعين)
  const now = catalog.dataUpdatedAt;
  const retry = () => void catalog.refetch();

  if (!salons && !online) {
    return (
      <SafeAreaView style={styles.root} edges={["top"]}>
        <NoConnection onRetry={retry} retrying={catalog.isFetching} />
      </SafeAreaView>
    );
  }

  const refresh = async () => {
    setPulling(true);
    await catalog.refetch();
    setPulling(false);
  };

  let body;
  if (!salons) {
    body = catalog.isError ? (
      <EmptyState illustration="no_internet" title={t("loadErrorTitle")}>
        <Button label={tOffline("retry")} icon="refresh" onPress={retry} />
      </EmptyState>
    ) : (
      <HomeSkeleton />
    );
  } else if (salons.length === 0) {
    body = (
      <EmptyState illustration="search_no_results" title={t("areaEmptyTitle")} message={t("areaEmptyBody", { area: area?.name ?? "" })}>
        <Button label={t("changeArea")} icon="map_pin" onPress={() => setSheetOpen(true)} />
      </EmptyState>
    );
  } else {
    body = online ? <HomeLive salons={salons} now={now} sort={sort} onSort={setSort} /> : <HomeOffline salons={salons} now={now} />;
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      {salons && !online && <OfflineBar updatedAt={f.time(new Date(now).toISOString())} onRetry={retry} />}
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={salons ? <RefreshControl refreshing={pulling} onRefresh={refresh} tintColor={colors.teal} colors={[colors.teal]} /> : undefined}
      >
        <View style={[styles.content, { maxWidth: listMaxWidth }]}>
          {salons || catalog.isError ? (
            <View style={{ paddingHorizontal: gutter }}>
              <HomeHeader areaLabel={area ? t("areaWithCity", { area: area.name, city: area.city }) : ""} onPressArea={() => setSheetOpen(true)} />
            </View>
          ) : null}
          {body}
        </View>
      </ScrollView>
      <AreaSheet open={sheetOpen} onClose={() => setSheetOpen(false)} areas={areas} selectedId={areaId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { flexGrow: 1 },
  content: { width: "100%", alignSelf: "center" },
});
