// متابعة الدور (فريم 27 لسه بدري، 28 قرّب): الكارت والشريط والبانر بس بيصفّروا لما يفضل واحد — الخلفية فاضلة بيضا.
import { ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { QueueProgress } from "@/components/molecules/progress";
import { GroupLabel } from "@/components/molecules/settings-group";
import { salonName, SalonThumb } from "@/components/organs/salon-card";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { QueueBooking } from "@/lib/types/booking";
import type { SalonPage } from "@/lib/types/salon";
import { travelMinutes } from "@/lib/utils/booking/booking-pricing";
import { callPhone, openDirections } from "@/lib/utils/external-links";
import { colors, radius, tone } from "@/styles/tokens";
import { duration } from "@/theme/motion";
import { joinNames, leaveAt } from "../__lib/queue-labels";

function TicketCard({ booking, approaching }: { booking: QueueBooking; approaching: boolean }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const c = approaching ? tone.warning : tone.primary;
  const ahead = t("queue.ahead", { count: booking.peopleAhead, n: f.count(booking.peopleAhead) });
  return (
    <View
      style={[styles.ticket, { backgroundColor: c.background, borderColor: c.border }]}
      accessible
      accessibilityLabel={`${t("booking.confirmed.ticket")} ${f.number(booking.ticketNumber)}، ${ahead}`}
      accessibilityLiveRegion="polite"
    >
      <Text dense variant="metaStrong" weight="extrabold" color={c.foreground}>
        {t("booking.confirmed.ticket")}
      </Text>
      <Text variant="queueNumber" color={approaching ? colors.warnText : colors.teal} style={styles.number}>
        {f.number(booking.ticketNumber)}
      </Text>
      <View style={styles.pill}>
        <Icon name="users" size={15} color={c.foreground} />
        <Animated.View key={booking.peopleAhead} entering={FadeInDown.duration(duration.medium)}>
          <Text variant="bodyStrong" size={14} weight="extrabold" color={c.foreground}>
            {ahead}
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

export function Stats({ items }: { items: [string, string][] }) {
  return (
    <View style={styles.stats}>
      {items.map(([label, value], i) => (
        <View key={label} style={styles.statWrap}>
          {i > 0 && <View style={styles.vline} />}
          <View style={styles.stat}>
            <Text dense variant="caption" weight="semibold">
              {label}
            </Text>
            <Animated.View key={value} entering={FadeIn.duration(duration.fast)}>
              <Text variant="statValue">{value}</Text>
            </Animated.View>
          </View>
        </View>
      ))}
    </View>
  );
}

function LiveNow({ page }: { page: SalonPage }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const names = page.barbers.filter((b) => b.queue !== null).map((b) => b.name);
  const row = (icon: IconName, text: string) => (
    <View style={styles.liveRow}>
      <Icon name={icon} size={15} color={colors.ok} />
      <Text variant="body" size={13.5} style={styles.flex}>
        {text}
      </Text>
    </View>
  );
  return (
    <View style={styles.outlined}>
      <GroupLabel>{t("queue.liveNow")}</GroupLabel>
      {row("chair", t("salon.chairs", { count: page.chairsActive, n: f.count(page.chairsActive) }))}
      {names.length > 0 && row("users", t("queue.onShift", { names: joinNames(names, t("queue.listSeparator"), (a, b) => t("queue.listTwo", { a, b })) }))}
    </View>
  );
}

export function SalonCard({ booking, page }: { booking: QueueBooking; page: SalonPage | undefined }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  return (
    <View style={[styles.outlined, styles.salon]}>
      <View style={styles.salonTop}>
        <SalonThumb size={48} />
        <View style={styles.flex}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {salonName(booking.salonName)}
          </Text>
          <Text dense variant="meta" numberOfLines={2}>
            {booking.services.map((s) => s.name).join(t("queue.servicesJoiner"))}
            {"  ·  "}
            <Text dense variant="metaStrong" color={colors.textPrimary}>
              {f.price(booking.total)}
            </Text>
          </Text>
        </View>
      </View>
      <View style={styles.salonActions}>
        <Button label={t("salon.directions")} icon="navigation" variant="secondary" size="sm" style={styles.flex} onPress={() => openDirections(booking.latitude, booking.longitude, booking.salonName)} />
        <Button label={t("salon.call")} icon="phone" variant="secondary" size="sm" style={styles.flex} disabled={!page} onPress={() => page && callPhone(page.phone)} />
      </View>
    </View>
  );
}

interface Props {
  booking: QueueBooking;
  page: SalonPage | undefined;
  approaching: boolean;
  now: number;
  leave: React.ReactNode;
}

export function Tracking({ booking, page, approaching, now, leave }: Props) {
  const t = useTranslations("mobile.queue");
  const f = useFormat();
  const { gutter, listMaxWidth } = useResponsive();
  const travel = page ? travelMinutes(page.summary.distanceKm) : null;
  const at = travel === null ? null : leaveAt(booking.waitMinutes, travel, now);

  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}>
      {approaching && (
        <Animated.View entering={FadeInDown.duration(duration.medium)} style={styles.banner} accessibilityLiveRegion="assertive">
          <Icon name="navigation" size={20} color={colors.onWarn} />
          <View style={styles.flex}>
            <Text variant="bodyStrong" size={15} weight="extrabold" color={colors.onWarn}>
              {t("moveNowTitle")}
            </Text>
            {travel !== null && (
              <Text dense variant="metaStrong" color={colors.onWarn}>
                {t("moveNowBody", { travel: f.number(travel), wait: f.number(booking.waitMinutes) })}
              </Text>
            )}
          </View>
        </Animated.View>
      )}
      <TicketCard booking={booking} approaching={approaching} />
      <View style={styles.gap20}>
        <QueueProgress stage={approaching ? "almost" : "waiting"} />
      </View>
      <View style={styles.gap20}>
        <Stats
          items={[
            [t("expected"), t("approxShort", { n: f.number(booking.waitMinutes) })],
            approaching
              ? [t("distance"), page ? f.distance(page.summary.distanceKm) : "—"]
              : [t("leaveAt"), travel === null ? "—" : at === null ? t("leaveAtNow") : f.time(new Date(at).toISOString())],
          ]}
        />
      </View>
      {approaching ? (
        <Button label={t("openDirections")} icon="navigation" style={styles.gap16} onPress={() => openDirections(booking.latitude, booking.longitude, booking.salonName)} />
      ) : (
        <>
          {page && <LiveNow page={page} />}
          <SalonCard booking={booking} page={page} />
        </>
      )}
      <View style={styles.leave}>{leave}</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { width: "100%", alignSelf: "center", paddingTop: 16, paddingBottom: 24 },
  flex: { flex: 1, minWidth: 0 },
  banner: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: colors.warn, borderRadius: radius.card, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 14 },
  ticket: { borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: 18, paddingVertical: 22, alignItems: "center" },
  number: { marginTop: 2, marginBottom: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 7, backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: 16, paddingVertical: 8 },
  gap20: { marginTop: 20 },
  gap16: { marginTop: 16 },
  stats: { flexDirection: "row", backgroundColor: colors.surf, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 16 },
  statWrap: { flex: 1, flexDirection: "row" },
  vline: { width: 1, backgroundColor: colors.line, marginHorizontal: 16 },
  stat: { flex: 1, alignItems: "center", gap: 3 },
  outlined: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 16, marginTop: 10 },
  liveRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 4, marginBottom: 7 },
  salon: { padding: 14 },
  salonTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  salonActions: { flexDirection: "row", gap: 9, marginTop: 13 },
  leave: { marginTop: 14 },
});
