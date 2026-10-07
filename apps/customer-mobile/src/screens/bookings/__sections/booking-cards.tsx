// كروت حجوزاتي (فريم 09–10): كارت الدور الحي مختلف عن الباقي (teal، رقم كبير، زرار واحد)، المعاد المحجوز، والزيارات السابقة.
import { router } from "expo-router";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { Stars } from "@/components/molecules/rating";
import { Badge, StatusDot } from "@/components/molecules/status-badges";
import { Meta, salonName, SalonThumb } from "@/components/organs/salon-card";
import { useBookingLabels } from "@/lib/hooks/booking";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { QueueBooking } from "@/lib/types/booking";
import { bookingDraft } from "@/lib/utils/booking-draft";
import { queueStage, TURN_GRACE_MS } from "@/lib/utils/booking/booking-pricing";
import { colors, radius } from "@/styles/tokens";

const openQueue = (b: QueueBooking) => router.push({ pathname: "/queue/[bookingId]", params: { bookingId: b.id } });

function useMeta(b: QueueBooking) {
  const t = useTranslations("mobile");
  return {
    services: b.services.map((s) => s.name).join(t("queue.servicesJoiner")),
    barber: b.barberName ?? t("booking.barber.anyTitle"),
  };
}

/** الدور الشغّال: رقم يتقري من بعيد وزرار واحد كبير */
export function ActiveQueueCard({ booking: b }: { booking: QueueBooking }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const meta = useMeta(b);
  const stage = queueStage(b);
  const left =
    stage === "yourTurn"
      ? t("queue.yourTurn.title")
      : stage === "inService"
        ? t("queue.inServiceTitle")
        : `${t("bookings.aheadWait", { count: b.peopleAhead, n: f.count(b.peopleAhead) })} `;
  return (
    <View style={styles.active}>
      <View style={styles.activeTop}>
        <StatusDot />
        <Text dense variant="metaStrong" size={13} weight="extrabold" color={colors.tealDark} style={styles.flex}>
          {t("bookings.activeNow")}
        </Text>
        <Text dense variant="metaStrong" size={13} weight="semibold" color={colors.tealDark} numberOfLines={1} style={styles.shrink}>
          {salonName(b.salonName)}
        </Text>
      </View>
      <View style={styles.numbers}>
        <View>
          <Text dense variant="caption" weight="bold" color={colors.tealDark}>
            {t("bookings.yourNumber")}
          </Text>
          <Text variant="displayMd" digits color={colors.teal}>
            {f.number(b.ticketNumber)}
          </Text>
        </View>
        <View style={styles.vline} />
        <View style={[styles.flex, styles.leftCol]}>
          <Text dense variant="caption" weight="bold" color={colors.tealDark}>
            {t("bookings.left")}
          </Text>
          <Text variant="bodyStrong" size={19} weight="extrabold" color={colors.tealDark} numberOfLines={2}>
            {left}
            {stage === "waiting" || stage === "approaching" ? (
              <Text variant="body" size={15} weight="semibold" color={colors.tealDark}>
                {t("bookings.approx", { n: f.number(b.waitMinutes) })}
              </Text>
            ) : null}
          </Text>
        </View>
      </View>
      <Meta
        items={[
          meta.services,
          ...[b.barberName ? t("bookings.withBarber", { barber: b.barberName }) : meta.barber, f.price(b.total)].map((part) => (
            <Text key={part} dense variant="metaStrong" weight="semibold" color={colors.tealDark} numberOfLines={1}>
              {part}
            </Text>
          )),
        ]}
        barColor={colors.tealTint2}
        style={styles.activeMeta}
      />
      <Button label={t("booking.trackTurn")} onPress={() => openQueue(b)} />
    </View>
  );
}

function OutlinedCard({ booking: b, badge, caption, extraMeta, rating, children, actions }: { booking: QueueBooking; badge: ReactNode; caption: string; extraMeta?: string; rating?: number | null; children?: ReactNode; actions: ReactNode }) {
  const t = useTranslations("mobile.bookings");
  const f = useFormat();
  const meta = useMeta(b);
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        {badge}
        <Text dense variant="caption" numberOfLines={1} style={styles.shrink}>
          {caption}
        </Text>
      </View>
      <View style={styles.salon}>
        <SalonThumb size={56} />
        <View style={styles.salonText}>
          <Text variant="itemTitle" numberOfLines={1}>
            {salonName(b.salonName)}
          </Text>
          <Meta items={[meta.services, <Text key="barber" dense variant="meta" numberOfLines={1}>{meta.barber}</Text>]} />
          {extraMeta ? (
            <Text dense variant="meta">{extraMeta}</Text>
          ) : (
            <View style={styles.priceRow}>
              <Text dense variant="metaStrong" color={colors.textPrimary}>
                {f.price(b.total)}
              </Text>
              {rating != null && (
                <>
                  <Stars value={rating} size={13} />
                  <Text dense variant="caption">
                    {t("yourRating")}
                  </Text>
                </>
              )}
            </View>
          )}
        </View>
      </View>
      {children}
      <View style={styles.actions}>{actions}</View>
    </View>
  );
}

export function UpcomingCard({ booking: b }: { booking: QueueBooking }) {
  const t = useTranslations("mobile.bookings");
  const labels = useBookingLabels();
  return (
    <OutlinedCard
      booking={b}
      badge={<Badge label={t("upcomingBadge")} kind="soon" icon="clock" />}
      caption={labels.timing(b.startAt)}
      actions={
        <>
          <Button label={t("details")} variant="secondary" size="sm" style={styles.flex} onPress={() => openQueue(b)} />
          {/* الإلغاء بيقول الأثر، فبيحصل في شاشة الحجز نفسها (زي Flutter) */}
          <Button label={t("cancel")} variant="dangerOutline" size="sm" style={styles.flex} onPress={() => openQueue(b)} />
        </>
      }
    />
  );
}

export function PastCard({ booking: b }: { booking: QueueBooking }) {
  const t = useTranslations("mobile.bookings");
  const f = useFormat();
  const completed = b.status === "completed";
  const missed = b.status === "missed";
  const at = b.startAt ?? b.createdAt;
  const rebook = () => {
    bookingDraft.set(b.salonId, b.services);
    router.push({ pathname: "/salon/[salonId]/book/slot", params: { salonId: b.salonId, ...(b.barberId && { barber: b.barberId }) } });
  };
  return (
    <OutlinedCard
      booking={b}
      badge={completed ? <Badge label={t("done")} icon="check" /> : <Badge label={missed ? t("missedBadge") : t("cancelledBadge")} kind="missed" icon="close" />}
      // اليوم والساعة بس: اسم اليوم بيزق البادج برة السطر (زي Flutter)
      caption={t("pastDate", { date: f.dayMonth(at), time: f.time(at) })}
      extraMeta={missed ? t("missedReason", { n: f.count(TURN_GRACE_MS / 60_000) }) : undefined}
      rating={b.rating}
      actions={<Button label={t("rebook")} icon="repeat" variant={missed ? "secondary" : "ghost"} size="sm" style={styles.flex} onPress={rebook} />}
    >
      {completed && b.rating === null && (
        <View style={styles.rate}>
          <Icon name="star_filled" size={15} color={colors.warnText} />
          <Text dense variant="metaStrong" color={colors.warnText} style={styles.flex}>
            {b.barberName ? t("rateBarberAndSalon", { barber: b.barberName }) : t("rateSalon")}
          </Text>
          <LinkButton label={t("rateNow")} color={colors.warnText} underline onPress={() => router.push({ pathname: "/booking/[bookingId]/rate", params: { bookingId: b.id } })} />
        </View>
      )}
    </OutlinedCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  shrink: { flexShrink: 1 },
  active: { backgroundColor: colors.tealTint, borderWidth: 1, borderColor: colors.tealTint2, borderRadius: radius.card, padding: 18 },
  activeTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  numbers: { flexDirection: "row", alignItems: "flex-end", gap: 22, marginBottom: 18 },
  vline: { width: 1, height: 52, backgroundColor: colors.tealTint2, marginBottom: 2 },
  leftCol: { paddingBottom: 6 },
  activeMeta: { marginBottom: 16 },
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginBottom: 12 },
  salon: { flexDirection: "row", gap: 12 },
  salonText: { flex: 1, minWidth: 0, gap: 5 },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  rate: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.warnTint, borderRadius: radius.field, paddingHorizontal: 12, paddingVertical: 11, marginTop: 14 },
  actions: { flexDirection: "row", gap: 10, marginTop: 14 },
});
