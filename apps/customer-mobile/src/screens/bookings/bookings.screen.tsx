// حجوزاتي (فريم 09–11): الحالية (الدور الحي، المواعيد) والسابقة (قيّم / احجز تاني). الضيف: سجّل دخول (الحجوزات محتاجة حساب).
import { router } from "expo-router";
import { useState, type ReactNode } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { Notice } from "@/components/molecules/notice";
import { SegmentedTabs } from "@/components/molecules/tabs";
import { NoConnection } from "@/components/organs/no-connection";
import { useMyBookings } from "@/lib/hooks/booking";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { useSession } from "@/lib/hooks/use-session.hook";
import { splitBookings } from "@/lib/utils/booking/bookings-list";
import { isRunning } from "@/lib/utils/booking/booking-pricing";
import { colors } from "@/styles/tokens";
import { ActiveQueueCard, PastCard, UpcomingCard } from "./__sections/booking-cards";

type Tab = "current" | "past";

export default function BookingsScreen() {
  const t = useTranslations("mobile");
  const { gutter, listMaxWidth } = useResponsive();
  const { hasSession } = useSession();
  const online = useOnline();
  const q = useMyBookings(hasSession);
  const [tab, setTab] = useState<Tab>("current");
  const { active, past } = splitBookings(q.data ?? []);
  const list = tab === "current" ? active : past;

  let body: ReactNode;
  if (!hasSession) {
    body = (
      <EmptyState illustration="empty_bookings" title={t("account.guest.title")} message={t("account.guest.body")}>
        <Button label={t("account.guest.cta")} onPress={() => router.push({ pathname: "/login", params: { from: "/bookings" } })} />
      </EmptyState>
    );
  } else if (!q.data) {
    body = q.isError ? (
      online ? (
        <EmptyState illustration="no_internet" illustrationWidth={170} title={t("bookings.loadFailed")}>
          <Button label={t("offline.retry")} icon="refresh" onPress={() => void q.refetch()} />
        </EmptyState>
      ) : (
        <NoConnection onRetry={() => void q.refetch()} retrying={q.isFetching} />
      )
    ) : (
      <ActivityIndicator style={styles.loading} color={colors.teal} />
    );
  } else if (!list.length) {
    body =
      tab === "current" ? (
        <EmptyState illustration="empty_bookings" title={t("bookings.emptyTitle")} message={t("bookings.emptyBody")}>
          <Button label={t("bookings.emptyCta")} onPress={() => router.navigate("/search")} />
        </EmptyState>
      ) : (
        <EmptyState illustration="empty_bookings" title={t("bookings.pastEmptyTitle")} message={t("bookings.pastEmptyBody")} />
      );
  } else {
    body = (
      <View style={styles.list}>
        {list.map((b) =>
          isRunning(b) ? <ActiveQueueCard key={b.id} booking={b} /> : b.status === "upcoming" ? <UpcomingCard key={b.id} booking={b} /> : <PastCard key={b.id} booking={b} />,
        )}
        {tab === "current" && (
          <Notice tone="primary" icon="bell">
            {t("bookings.notifyNote")}
          </Notice>
        )}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}
        refreshControl={hasSession ? <RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} colors={[colors.teal]} /> : undefined}
      >
        <Text variant="pageTitle" accessibilityRole="header" style={styles.title}>
          {t("screens.bookings")}
        </Text>
        {hasSession && (
          <SegmentedTabs<Tab>
            tabs={[
              { key: "current", label: t("bookings.tabCurrent") },
              { key: "past", label: t("bookings.tabPast") },
            ]}
            value={tab}
            onChange={setTab}
          />
        )}
        <View style={styles.body}>{body}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, width: "100%", alignSelf: "center", paddingBottom: 24 },
  title: { paddingTop: 14, paddingBottom: 14 },
  body: { flex: 1, justifyContent: "center" },
  list: { flex: 1, justifyContent: "flex-start", gap: 12, marginTop: 18 },
  loading: { flex: 1 },
});
