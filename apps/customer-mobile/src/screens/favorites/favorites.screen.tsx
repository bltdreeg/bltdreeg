// الصالونات المفضّلة (فريم 34–35): مش قايمة أسماء — لوحة "أروح فين دلوقتي"، مرتّبة بأقل انتظار مش بتاريخ الإضافة.
// زي FavoritesPage في Flutter: الزرار بيفتح الصالون ("ادخل الطابور"، أو "شوف الصالون" لو مقفول).
import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { SalonRowSkeleton } from "@/components/atoms/skeleton";
import { Button } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { Notice } from "@/components/molecules/notice";
import { TopBar } from "@/components/molecules/top-bar";
import { NoConnection } from "@/components/organs/no-connection";
import { SalonListItem } from "@/components/organs/salon-card";
import { useFavoriteIds, useFavoriteSalons } from "@/lib/hooks/favorites";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { isOpen, sortSalons } from "@/lib/utils/salons/salon-sort.utils";
import { colors } from "@/styles/tokens";

const openSalon = (salonId: string) => router.push({ pathname: "/salon/[salonId]", params: { salonId } });

export default function FavoritesScreen() {
  const t = useTranslations("mobile");
  const f = useFormat();
  const { gutter, listMaxWidth } = useResponsive();
  const online = useOnline();
  const ids = useFavoriteIds();
  const q = useFavoriteSalons();
  const salons = sortSalons(q.data ?? [], "leastWait");
  const empty = ids.data?.length === 0;

  // الضيف مابيوصلش هنا: المسار محمي (route-guards → login)
  let body;
  if (empty)
    body = (
      <EmptyState illustration="favorites_empty" title={t("favorites.emptyTitle")} message={t("favorites.emptyBody")}>
        <Button label={t("favorites.emptyCta")} onPress={() => router.navigate("/search")} />
      </EmptyState>
    );
  else if (!q.data)
    body =
      ids.isError || q.isError ? (
        online ? (
          <EmptyState illustration="favorites_empty" title={t("favorites.loadFailed")}>
            <Button label={t("offline.retry")} icon="refresh" onPress={() => void (ids.isError ? ids.refetch() : q.refetch())} />
          </EmptyState>
        ) : (
          <NoConnection onRetry={() => void (ids.isError ? ids.refetch() : q.refetch())} retrying={ids.isFetching || q.isFetching} />
        )
      ) : (
        <View style={styles.flex} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <SalonRowSkeleton />
          <SalonRowSkeleton />
          <SalonRowSkeleton />
        </View>
      );
  else
    body = (
      <View>
        {salons.map((s, i) => {
          const open = isOpen(s);
          return (
            <SalonListItem
              key={s.id}
              salon={s}
              now={q.dataUpdatedAt}
              live={online}
              divider={i < salons.length - 1}
              action={
                <Button
                  label={open ? t("favorites.joinQueue") : t("favorites.viewSalon")}
                  variant={open && s.queue.peopleAhead === 0 ? "ghost" : "secondary"}
                  size="xs"
                  style={styles.action}
                  onPress={() => openSalon(s.id)}
                />
              }
            />
          );
        })}
        <Notice tone="neutral" icon="bell">
          {t("favorites.notifyNote")}
        </Notice>
      </View>
    );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={[styles.column, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}>
        <TopBar title={t("screens.favorites")} subtitle={salons.length ? t("favorites.subtitle", { count: salons.length, n: f.count(salons.length) }) : undefined} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.column, styles.content, !!q.data && !empty && styles.top, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}
        refreshControl={<RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} colors={[colors.teal]} />}
      >
        {body}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  column: { width: "100%", alignSelf: "center" },
  content: { flexGrow: 1, justifyContent: "center", paddingBottom: 24 },
  top: { justifyContent: "flex-start" },
  action: { marginTop: 10 },
});
