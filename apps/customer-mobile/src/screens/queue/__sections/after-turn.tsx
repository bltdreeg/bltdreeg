// مش في البورد — من Flutter: الميعاد الجاي، على الكرسي، خلصت (قيّم)، فاتك، خرجت/اتلغى.
import { router } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { useBookingLabels } from "@/lib/hooks/booking";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { QueueBooking } from "@/lib/types/booking";
import type { SalonPage } from "@/lib/types/salon";
import { colors, radius } from "@/styles/tokens";
import { SalonCard, Stats } from "./tracking";

export const goHome = () => router.dismissTo("/home");

/** ميعاد لسه جاي: المعاد كبير، الحلاق والمدة، الصالون، "الغي الحجز" */
export function Upcoming({ booking, page, leave }: { booking: QueueBooking; page: SalonPage | undefined; leave: ReactNode }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const labels = useBookingLabels();
  const { gutter, listMaxWidth } = useResponsive();
  const minutes = booking.services.reduce((sum, s) => sum + s.durationMinutes, 0);
  return (
    <ScrollView contentContainerStyle={[styles.upcoming, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}>
      <View style={styles.appointment}>
        <Text dense variant="metaStrong" weight="extrabold" color={colors.tealDark}>
          {t("booking.confirmed.appointment")}
        </Text>
        <Text variant="displayMd" color={colors.teal} style={styles.time}>
          {f.time(booking.startAt!)}
        </Text>
        <Text variant="bodyStrong" color={colors.tealDark}>
          {labels.day(booking.startAt!)}
        </Text>
      </View>
      <View style={styles.gap20}>
        <Stats
          items={[
            [t("booking.review.barber"), booking.barberName ?? t("booking.barber.anyTitle")],
            [t("queue.durationLabel"), t("salon.duration", { n: f.number(minutes) })],
          ]}
        />
      </View>
      <SalonCard booking={booking} page={page} />
      <View style={styles.leave}>{leave}</View>
    </ScrollView>
  );
}

export function InService({ booking, page }: { booking: QueueBooking; page: SalonPage | undefined }) {
  const t = useTranslations("mobile.queue");
  const { gutter, listMaxWidth } = useResponsive();
  return (
    <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: gutter, maxWidth: listMaxWidth }]}>
      <View style={styles.circle}>
        <Icon name="chair" size={44} color={colors.okDark} />
      </View>
      <Text variant="emptyTitle" size={24} accessibilityRole="header" style={styles.title}>
        {t("inServiceTitle")}
      </Text>
      <Text variant="body" color={colors.textSecondary} style={styles.body}>
        {t("inServiceBody")}
      </Text>
      <SalonCard booking={booking} page={page} />
    </ScrollView>
  );
}

export function Ended({ booking }: { booking: QueueBooking }) {
  const t = useTranslations("mobile");
  const bookAgain = () => router.replace({ pathname: "/salon/[salonId]", params: { salonId: booking.salonId } });
  const home = <Button label={t("booking.backHome")} variant="secondary" onPress={goHome} />;
  return (
    <View style={styles.fill}>
      {booking.status === "completed" ? (
        <EmptyState illustration="queue_joined" illustrationWidth={130} title={t("queue.completedTitle")} message={t("queue.completedBody", { salon: booking.salonName })}>
          <Button label={t("queue.rate")} onPress={() => router.push({ pathname: "/booking/[bookingId]/rate", params: { bookingId: booking.id } })} />
          {home}
        </EmptyState>
      ) : (
        <EmptyState
          illustration="empty_bookings"
          illustrationWidth={170}
          title={booking.status === "missed" ? t("queue.missedTitle") : booking.startAt ? t("queue.bookingCancelledTitle") : t("queue.cancelledTitle")}
          message={booking.status === "missed" ? t("queue.missedBody") : booking.startAt ? t("queue.bookingCancelledBody") : t("queue.cancelledBody")}
        >
          <Button label={t("queue.bookAgain")} onPress={bookAgain} />
          {home}
        </EmptyState>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: "center" },
  content: { width: "100%", alignSelf: "center", paddingTop: 48, paddingBottom: 24 },
  upcoming: { width: "100%", alignSelf: "center", paddingTop: 18, paddingBottom: 24 },
  appointment: { backgroundColor: colors.tealTint, borderWidth: 1, borderColor: colors.tealTint2, borderRadius: radius.lg, padding: 22, alignItems: "center" },
  time: { marginTop: 4, marginBottom: 6 },
  gap20: { marginTop: 20 },
  leave: { marginTop: 14 },
  circle: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.okTint, alignItems: "center", justifyContent: "center", alignSelf: "center" },
  title: { textAlign: "center", marginTop: 18 },
  body: { textAlign: "center", marginTop: 8, marginBottom: 14 },
});
