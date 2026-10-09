// دخلت الطابور (فريم 26): الرقم فوراً وزرار مباشر للمتابعة — المستخدم مايدوّرش على دوره. الميعاد بيعرض المعاد بدل الرقم
// و"حجوزاتي" (زي Flutter). × بيروح للرئيسية (الرحلة اتقفلت).
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { IconButton } from "@/components/molecules/icon-button";
import { salonName } from "@/components/organs/salon-card";
import { useBooking, useBookingLabels } from "@/lib/hooks/booking";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { QueueBooking } from "@/lib/types/booking";
import { openDirections } from "@/lib/utils/external-links";
import { colors, radius } from "@/styles/tokens";
import { duration } from "@/theme/motion";
import { QueueJoinedArt } from "./__sections/queue-joined-art";

const goHome = () => router.dismissTo("/home");
const enter = (step: number) => FadeInDown.duration(duration.medium).delay(step * 150);

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text dense variant="caption" size={11.5} weight="semibold" color={colors.tealDark}>
        {label}
      </Text>
      <Text variant="bodyStrong" size={16} weight="extrabold" color={colors.tealDark} style={styles.center}>
        {value}
      </Text>
    </View>
  );
}

function Ticket({ booking: b }: { booking: QueueBooking }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const { isShort } = useResponsive();
  return (
    <>
      <Text dense variant="metaStrong" weight="extrabold" color={colors.tealDark}>
        {t("booking.confirmed.ticket")}
      </Text>
      <Text variant={isShort ? "displaySm" : "displayLg"} color={colors.teal}>
        {f.number(b.ticketNumber)}
      </Text>
      <View style={styles.stats}>
        <Stat label={t("booking.confirmed.ahead")} value={t("booking.confirmed.aheadCount", { count: b.peopleAhead, n: f.count(b.peopleAhead) })} />
        <View style={styles.vline} />
        <Stat label={t("booking.confirmed.expected")} value={b.waitMinutes === 0 ? t("booking.barber.immediate") : t("booking.confirmed.approx", { n: f.number(b.waitMinutes) })} />
      </View>
    </>
  );
}

/** الميعاد: الساعة كبيرة واليوم، والحلاق والإجمالي */
function Appointment({ booking: b }: { booking: QueueBooking }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const labels = useBookingLabels();
  return (
    <>
      <Text dense variant="metaStrong" weight="extrabold" color={colors.tealDark}>
        {t("booking.confirmed.appointment")}
      </Text>
      <Text variant="displayMd" color={colors.teal} style={styles.time}>
        {f.time(b.startAt!)}
      </Text>
      <Text variant="bodyStrong" color={colors.tealDark}>
        {labels.day(b.startAt!)}
      </Text>
      <View style={styles.stats}>
        <Stat label={t("booking.review.barber")} value={b.barberName ?? t("booking.barber.anyTitle")} />
        <View style={styles.vline} />
        <Stat label={t("booking.review.total")} value={f.price(b.total)} />
      </View>
    </>
  );
}

function Confirmed({ booking }: { booking: QueueBooking }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const labels = useBookingLabels();
  const { gutter, formMaxWidth, isShort, height } = useResponsive();
  // ٣٢٠×٥٦٨ (SE): أصغر كمان
  const tiny = height < 600;
  const b = booking;
  const isQueue = b.startAt === null;
  return (
    // الشاشات القصيرة (٥٦٨–٦٤٠): كل حاجة أصغر شوية عشان "تابع دورك" يبان من غير سكرول
    <ScrollView contentContainerStyle={[styles.content, isShort && styles.short, { paddingHorizontal: gutter, maxWidth: formMaxWidth }]}>
      <Animated.View entering={enter(0)} style={[styles.head, tiny && styles.headTiny]}>
        <QueueJoinedArt width={tiny ? 56 : isShort ? 88 : 146} />
        <Text variant="pageTitle" accessibilityRole="header" style={[styles.center, styles.title]}>
          {isQueue ? t("screens.bookingConfirmed") : t("booking.confirmed.slotTitle")}
        </Text>
        <Text variant="bodyLong" style={styles.center}>
          {t("common.dot", { a: salonName(b.salonName), b: b.salonArea })}
        </Text>
      </Animated.View>

      <Animated.View
        entering={enter(1)}
        style={[styles.ticket, tiny && styles.ticketTiny]}
        accessible
        accessibilityLabel={isQueue ? `${t("booking.confirmed.ticket")} ${f.number(b.ticketNumber)}` : `${t("booking.confirmed.appointment")} ${labels.timing(b.startAt)}`}
      >
        {isQueue ? <Ticket booking={b} /> : <Appointment booking={b} />}
      </Animated.View>

      <Animated.View entering={enter(2)}>
        <View style={styles.actions}>
          <Button
            label={isQueue ? t("booking.trackTurn") : t("screens.bookings")}
            style={styles.flex}
            onPress={() => (isQueue ? router.replace({ pathname: "/queue/[bookingId]", params: { bookingId: b.id } }) : router.dismissTo("/bookings"))}
          />
          <Button label={t("salon.directions")} icon="navigation" variant="secondary" size="xs" style={styles.directions} onPress={() => openDirections(b.latitude, b.longitude, b.salonName)} />
        </View>
        <Text variant="metaStrong" weight="semibold" color={colors.textSecondary} style={[styles.center, styles.note]}>
          {isQueue ? t("booking.confirmed.note") : t("booking.confirmed.slotNote")}
        </Text>
      </Animated.View>
    </ScrollView>
  );
}

export default function BookingConfirmedScreen() {
  const t = useTranslations("mobile");
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { gutter } = useResponsive();
  const insets = useSafeAreaInsets();
  const q = useBooking(bookingId);

  return (
    <SafeAreaView style={styles.root}>
      {q.data ? (
        <Confirmed booking={q.data} />
      ) : q.isError ? (
        <View style={styles.fill}>
          <EmptyState illustration="empty_bookings" illustrationWidth={170} title={t("booking.errors.loadFailed")} message={t("booking.errors.generic")}>
            <Button label={t("booking.retry")} icon="refresh" onPress={() => void q.refetch()} />
            <Button label={t("booking.backHome")} variant="ghost" onPress={goHome} />
          </EmptyState>
        </View>
      ) : (
        <ActivityIndicator style={styles.fill} color={colors.teal} />
      )}
      <View style={[styles.close, { start: gutter, top: insets.top + 6 }]}>
        <IconButton icon="close" onPress={goHome} accessibilityLabel={t("a11y.close")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  fill: { flex: 1, justifyContent: "center" },
  // absolute مابيحترمش padding الـ SafeAreaView
  close: { position: "absolute" },
  content: { flexGrow: 1, justifyContent: "center", width: "100%", alignSelf: "center", paddingTop: 56, paddingBottom: 40 },
  short: { paddingTop: 48, paddingBottom: 16 },
  head: { alignItems: "center", paddingBottom: 18 },
  headTiny: { paddingBottom: 10 },
  title: { marginTop: 16, marginBottom: 4 },
  // alignSelf stretch: Android بيقص نص مركّز بخط مخصوص جوه أب alignItems center
  center: { textAlign: "center", alignSelf: "stretch" },
  ticket: { backgroundColor: colors.tealTint, borderWidth: 1, borderColor: colors.tealTint2, borderRadius: radius.card, padding: 20, alignItems: "center" },
  time: { marginTop: 4 },
  ticketTiny: { padding: 14 },
  stats: { flexDirection: "row", alignSelf: "stretch", marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.tealTint2 },
  stat: { flex: 1, alignItems: "center", gap: 2 },
  vline: { width: 1, backgroundColor: colors.tealTint2, marginHorizontal: 8 },
  actions: { flexDirection: "row", gap: 10, marginTop: 16 },
  flex: { flex: 1 },
  // minWidth مش flexBasis: بخط ١٤٠٪ الكلمة مابتتقصش
  directions: { minWidth: 130, height: 52 },
  note: { marginTop: 16, lineHeight: 21 },
});
