// الإشعارات (فريم 32–33) — زي NotificationsPage في Flutter: متجمّعة بالعمر، الأحدث الأول.
// "حان دورك" و"فاضلك واحد" غير المقروءين بس بشريط جانبي ملوّن (عشان يتفرقوا عن العروض بنظرة). الضغط = مقروء + يفتح المكان.
import { router } from "expo-router";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { GroupLabel } from "@/components/molecules/settings-group";
import { StatusDot } from "@/components/molecules/status-badges";
import { TopBar } from "@/components/molecules/top-bar";
import { NoConnection } from "@/components/organs/no-connection";
import { useMarkRead, useNotifications } from "@/lib/hooks/notifications";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { useSession } from "@/lib/hooks/use-session.hook";
import type { AppNotification, NotificationKind } from "@/lib/types/notification";
import { timeAgo } from "@/lib/utils/format/time-ago.utils";
import { groupNotifications, isQueueKind } from "@/lib/utils/notifications/notification-groups";
import { colors, radius, tone, type Tone } from "@/styles/tokens";

const KIND: Record<NotificationKind, { icon: IconName; color: string; tone: Tone }> = {
  yourTurn: { icon: "users", color: colors.tealDark, tone: "primary" },
  almostUp: { icon: "navigation", color: colors.warnText, tone: "warning" },
  queueMoved: { icon: "users", color: colors.textSecondary, tone: "neutral" },
  offer: { icon: "gift", color: colors.primary, tone: "neutral" },
  rateReminder: { icon: "star_filled", color: colors.rating, tone: "neutral" },
  cancelled: { icon: "close", color: colors.error, tone: "neutral" },
};

function open(n: AppNotification) {
  if (n.kind === "rateReminder" && n.bookingId) router.push({ pathname: "/booking/[bookingId]/rate", params: { bookingId: n.bookingId } });
  else if (n.kind === "offer" && n.salonId) router.push({ pathname: "/salon/[salonId]", params: { salonId: n.salonId } });
  else if (n.bookingId) router.push({ pathname: "/queue/[bookingId]", params: { bookingId: n.bookingId } });
}

function Item({ n, now, onPress }: { n: AppNotification; now: number; onPress: () => void }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const k = KIND[n.kind];
  const tn = tone[k.tone];
  const highlighted = !n.isRead && (n.kind === "yourTurn" || n.kind === "almostUp");
  const fg = highlighted ? tn.foreground : colors.textPrimary;
  const ago = timeAgo(n.createdAt, now);
  return (
    <Pressable
      onPress={onPress}
      pressedScale={0.99}
      accessibilityLabel={[n.title, n.body, n.isRead ? null : t("notifications.unread")].filter(Boolean).join("، ")}
      style={[styles.item, highlighted ? [styles.highlighted, { backgroundColor: tn.background, borderStartColor: tn.solid }] : styles.plain]}
    >
      <View style={styles.icon}>
        <Icon name={k.icon} size={20} color={k.color} />
      </View>
      <View style={styles.text}>
        <Text variant="bodyStrong" weight={highlighted ? "extrabold" : "bold"} color={fg}>
          {f.digits(n.title)}
        </Text>
        <Text variant="bodySm" weight={highlighted ? "semibold" : "regular"} color={highlighted ? tn.foreground : colors.textSecondary}>
          {f.digits(n.body)}
        </Text>
        <Text variant="caption" color={highlighted ? tn.foreground : undefined}>
          {t(`common.timeAgo.${ago.unit}`, { count: ago.count, n: f.count(ago.count) })}
        </Text>
      </View>
      {!n.isRead && (
        <View style={styles.dot}>
          <StatusDot color={isQueueKind(n.kind) ? tn.solid : colors.primary} />
        </View>
      )}
    </Pressable>
  );
}

export default function NotificationsScreen() {
  const t = useTranslations("mobile");
  const { gutter, listMaxWidth } = useResponsive();
  const { hasSession } = useSession();
  const online = useOnline();
  const q = useNotifications();
  const markRead = useMarkRead();
  const list = q.data ?? [];
  const unread = list.filter((n) => !n.isRead).length;

  let body;
  if (!hasSession)
    body = (
      <EmptyState illustration="notifications_empty" title={t("account.guest.title")} message={t("account.guest.body")}>
        <Button label={t("account.guest.cta")} onPress={() => router.push({ pathname: "/login", params: { from: "/home/notifications" } })} />
      </EmptyState>
    );
  else if (!q.data)
    body = q.isError ? (
      online ? (
        <EmptyState illustration="notifications_empty" title={t("notifications.loadFailed")}>
          <Button label={t("offline.retry")} icon="refresh" onPress={() => void q.refetch()} />
        </EmptyState>
      ) : (
        <NoConnection onRetry={() => void q.refetch()} retrying={q.isFetching} />
      )
    ) : (
      <ActivityIndicator style={styles.flex} color={colors.teal} />
    );
  else if (!list.length)
    body = (
      <EmptyState illustration="notifications_empty" title={t("notifications.emptyTitle")} message={t("notifications.emptyBody")}>
        <Button label={t("notifications.emptyCta")} onPress={() => router.navigate("/search")} />
      </EmptyState>
    );
  else
    body = (
      <View>
        {groupNotifications(list, q.dataUpdatedAt).map(([group, items]) => (
          <View key={group} style={styles.group}>
            <GroupLabel>{t(`notifications.groups.${group}`)}</GroupLabel>
            {items.map((n) => (
              <Item
                key={n.id}
                n={n}
                now={q.dataUpdatedAt}
                onPress={() => {
                  if (!n.isRead) markRead.mutate([n.id]);
                  open(n);
                }}
              />
            ))}
          </View>
        ))}
      </View>
    );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={[styles.column, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}>
        <TopBar title={t("screens.notifications")} trailing={unread > 0 ? <LinkButton label={t("notifications.markAllRead")} size={13} onPress={() => markRead.mutate(undefined)} /> : undefined} />
      </View>
      <ScrollView
        contentContainerStyle={[styles.column, styles.content, list.length > 0 && styles.top, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}
        refreshControl={hasSession ? <RefreshControl refreshing={q.isRefetching} onRefresh={() => void q.refetch()} colors={[colors.teal]} /> : undefined}
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
  content: { flexGrow: 1, justifyContent: "center", paddingTop: 8, paddingBottom: 24 },
  top: { justifyContent: "flex-start" },
  group: { marginBottom: 14 },
  item: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 13 },
  highlighted: { borderRadius: radius.md, borderStartWidth: 3, marginBottom: 9 },
  plain: { borderBottomWidth: 1, borderBottomColor: colors.line },
  icon: { marginTop: 2 },
  dot: { marginTop: 6 },
  text: { flex: 1, minWidth: 0, gap: 3 },
});
