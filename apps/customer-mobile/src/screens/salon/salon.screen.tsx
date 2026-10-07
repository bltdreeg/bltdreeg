// صفحة الصالون (فريم 21–23): صفحة واحدة بتسكرول فيها ٥ أقسام، والتابات بتتثبّت تحت الشريط العلوي وبتنط للقسم وبتتبعه.
// حالة الطابور تحت الاسم و"ادخل الطابور" ثابت تحت. من غير نت ببيانات: الانتظار "مش متحدّث" والحجز مقفول (زي Flutter).
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { RefreshControl, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedReaction, useAnimatedRef, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { scheduleOnRN } from "react-native-worklets";
import { Button } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { UnderlineTabs } from "@/components/molecules/tabs";
import { SectionDivider, TopBar } from "@/components/molecules/top-bar";
import { NoConnection } from "@/components/organs/no-connection";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { useSalonPage } from "@/lib/hooks/salons";
import type { SalonPage } from "@/lib/types/salon";
import { ApiError } from "@/lib/utils/api/api-error";
import { recentlyViewed } from "@/lib/utils/recently-viewed";
import { colors } from "@/styles/tokens";
import { SalonBarbers } from "./__sections/salon-barbers";
import { BookingBar } from "./__sections/booking-bar";
import { heroHeight, SalonHero, SalonTopBar, TOP_BAR } from "./__sections/salon-header";
import { SalonInfo } from "./__sections/salon-info";
import { SalonOffers } from "./__sections/salon-offers";
import { SalonHours, SalonReviews } from "./__sections/salon-reviews";
import { SalonServices } from "./__sections/salon-services";
import { SalonSkeleton } from "./__sections/salon-skeleton";

const SECTIONS = ["services", "barbers", "offers", "reviews", "hours"] as const;
type Section = (typeof SECTIONS)[number];
const TAB_LABEL = { services: "tabServices", barbers: "tabBarbers", offers: "tabOffers", reviews: "tabReviews", hours: "tabHours" } as const;

function Loaded({ page, live, now, refreshing, onRefresh }: { page: SalonPage; live: boolean; now: number; refreshing: boolean; onRefresh: () => void }) {
  const t = useTranslations("mobile.salon");
  const insets = useSafeAreaInsets();
  const { gutter, listMaxWidth } = useResponsive();
  const heroH = heroHeight(insets.top);
  const pinnedTop = insets.top + TOP_BAR;

  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollY = useSharedValue(0);
  // مواضع الأقسام والتابات جوه المحتوى (بعد الصورة) — بتتقاس من onLayout
  const offsets = useSharedValue<number[]>(SECTIONS.map(() => 0));
  const tabsY = useSharedValue(Number.MAX_SAFE_INTEGER);
  const [tabsH, setTabsH] = useState(52);
  const [active, setActive] = useState<Section>("services");
  const [pinned, setPinned] = useState(false);

  const maxScroll = useSharedValue(Number.MAX_SAFE_INTEGER);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.set(e.contentOffset.y);
    maxScroll.set(e.contentSize.height - e.layoutMeasurement.height);
  });
  const sync = (index: number, isPinned: boolean) => {
    setActive(SECTIONS[index]);
    setPinned(isPinned);
  };
  useAnimatedReaction(
    () => {
      const y = scrollY.get();
      const line = y + pinnedTop + tabsH + 8;
      let index = 0;
      offsets.get().forEach((o, i) => {
        if (o > 0 && o <= line) index = i;
      });
      // آخر قسم مش بيوصل لخط التابات — آخر الصفحة = آخر قسم
      if (y >= maxScroll.get() - 4) index = SECTIONS.length - 1;
      return index * 2 + (y >= tabsY.get() - pinnedTop ? 1 : 0);
    },
    (cur, prev) => {
      if (cur !== prev) scheduleOnRN(sync, cur >> 1, (cur & 1) === 1);
    },
  );

  const measure = (i: number) => (e: LayoutChangeEvent) => {
    const y = heroH + e.nativeEvent.layout.y;
    offsets.modify((o) => {
      "worklet";
      o[i] = y;
      return o;
    });
  };
  const jump = (s: Section) => scrollRef.current?.scrollTo({ y: offsets.get()[SECTIONS.indexOf(s)] - pinnedTop - tabsH, animated: true });

  const tabs = <UnderlineTabs tabs={SECTIONS.map((key) => ({ key, label: t(TAB_LABEL[key]) }))} value={active} onChange={jump} />;
  const section = (i: number, child: ReactNode) => (
    <View onLayout={measure(i)}>
      {i > 0 && <SectionDivider />}
      <View style={{ paddingHorizontal: gutter }}>{child}</View>
    </View>
  );

  return (
    <View style={styles.root}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        // زي Flutter RefreshIndicator(edgeOffset: الهيدر المثبّت)
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} progressViewOffset={pinnedTop} colors={[colors.teal]} />}
      >
        <SalonHero page={page} />
        <View style={[styles.content, { maxWidth: listMaxWidth }]}>
          <View style={{ paddingHorizontal: gutter }}>
            <SalonInfo page={page} live={live} now={now} />
          </View>
          <View
            style={styles.tabs}
            onLayout={(e) => {
              tabsY.set(heroH + e.nativeEvent.layout.y);
              setTabsH(e.nativeEvent.layout.height);
            }}
          >
            {tabs}
          </View>
          {section(0, <SalonServices salonId={page.summary.id} groups={page.serviceGroups} />)}
          {section(1, <SalonBarbers barbers={page.barbers} live={live} now={now} />)}
          {section(2, <SalonOffers offers={page.offers} now={now} />)}
          {section(3, <SalonReviews page={page} now={now} />)}
          {section(4, <SalonHours hours={page.hours} open={page.summary.opensAt === null} now={now} />)}
          <View style={styles.end} />
        </View>
      </Animated.ScrollView>
      {pinned && <View style={[styles.pinned, { top: pinnedTop }]}>{<View style={[styles.content, { maxWidth: listMaxWidth }]}>{tabs}</View>}</View>}
      <SalonTopBar page={page} scrollY={scrollY} collapseAt={heroH - pinnedTop} />
      <BookingBar salonId={page.summary.id} live={live} />
    </View>
  );
}

export default function SalonScreen() {
  const t = useTranslations("mobile.salon");
  const tHome = useTranslations("mobile.home");
  const tOffline = useTranslations("mobile.offline");
  const { salonId } = useLocalSearchParams<{ salonId: string }>();
  const insets = useSafeAreaInsets();
  const online = useOnline();
  const q = useSalonPage(salonId);

  useEffect(() => recentlyViewed.record(salonId), [salonId]);

  if (q.data) return <Loaded page={q.data} live={online} now={q.dataUpdatedAt} refreshing={q.isRefetching} onRefresh={() => void q.refetch()} />;
  if (!q.isError && online) return <SalonSkeleton heroHeight={heroHeight(insets.top)} />;

  const notFound = q.error instanceof ApiError && q.error.status === 404;
  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={styles.bar}>
        <TopBar />
      </View>
      {notFound ? (
        <EmptyState illustration="search_no_results" title={t("notFoundTitle")} message={t("notFoundBody")}>
          <Button label={t("backHome")} onPress={() => router.replace("/home")} />
        </EmptyState>
      ) : !online ? (
        <NoConnection onRetry={() => void q.refetch()} retrying={q.isFetching} />
      ) : (
        <EmptyState illustration="no_internet" title={tHome("loadErrorTitle")}>
          <Button label={tOffline("retry")} icon="refresh" onPress={() => void q.refetch()} />
        </EmptyState>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { width: "100%", alignSelf: "center" },
  tabs: { marginTop: 16 },
  pinned: { position: "absolute", start: 0, end: 0, backgroundColor: colors.bg },
  bar: { paddingHorizontal: 16 },
  end: { height: 16 },
});
