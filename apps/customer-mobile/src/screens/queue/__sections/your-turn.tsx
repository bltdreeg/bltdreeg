// حان دورك (فريم 29): أقوى حالة والخلفية لسه بيضا — دايرة خضرا، عدّاد ٥ دقايق، زرار أخضر. "اطلع من الطابور" مش في البورد
// بس زرار الرجوع مستخبي هنا، فده المخرج الوحيد لحد مش هيلحق (زي Flutter).
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Illustration } from "@/components/atoms/illustration";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { QueueBooking } from "@/lib/types/booking";
import { TURN_GRACE_MS, turnTimeLeft } from "@/lib/utils/booking/booking-pricing";
import { colors, radius } from "@/styles/tokens";
import { clock } from "../__lib/queue-labels";

interface Props {
  booking: QueueBooking;
  now: number;
  pending: "check-in" | "postpone" | "leave" | null;
  onCheckIn: () => void;
  onPostpone: () => void;
  leave: ReactNode;
}

export function YourTurn({ booking, now, pending, onCheckIn, onPostpone, leave }: Props) {
  const t = useTranslations("mobile.queue.yourTurn");
  const f = useFormat();
  const { gutter, formMaxWidth, isShort } = useResponsive();
  const left = f.ltr(clock(turnTimeLeft(booking, now)));
  const grace = { n: f.count(TURN_GRACE_MS / 60_000) };
  const busy = pending !== null;
  const width = { paddingHorizontal: gutter, maxWidth: formMaxWidth };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={[styles.center, width]}>
        <Illustration name="your_turn" width={isShort ? 84 : 104} />
        <Text variant="displayXs" color={colors.okDark} accessibilityRole="header" accessibilityLiveRegion="assertive" style={styles.title}>
          {t("title")}
        </Text>
        <Text variant="body" size={15.5} color={colors.textSecondary} style={styles.text}>
          {booking.barberName ? t("barberWaiting", { barber: booking.barberName }) : t("anyBarber")}
        </Text>
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text dense variant="caption" weight="bold" color={colors.okText2}>
              {t("number")}
            </Text>
            <Text variant="displaySm" color={colors.okDark}>
              {f.number(booking.ticketNumber)}
            </Text>
          </View>
          <View style={styles.vline} />
          <View style={styles.stat} accessible accessibilityLabel={`${t("timeLeft")} ${left}`}>
            <Text dense variant="caption" weight="bold" color={colors.okText2}>
              {t("timeLeft")}
            </Text>
            <Text variant="displaySm" color={colors.okDark} style={styles.tabular}>
              {left}
            </Text>
          </View>
        </View>
        <Text variant="caption" weight="semibold" style={[styles.text, styles.note]}>
          {booking.postponeUsed ? t("graceNoteFinal", grace) : t("graceNote", grace)}
        </Text>
      </ScrollView>
      <View style={[styles.actions, width]}>
        <Button label={t("atSalon")} variant="success" size="xl" loading={pending === "check-in"} disabled={busy} onPress={onCheckIn} />
        <Button
          label={booking.postponeUsed ? t("postponeUsed") : t("postpone")}
          variant="secondary"
          size="md"
          loading={pending === "postpone"}
          disabled={busy || booking.postponeUsed}
          onPress={onPostpone}
        />
        <View style={styles.leave}>{leave}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flexGrow: 1, width: "100%", alignSelf: "center", alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  title: { marginTop: 16, textAlign: "center" },
  text: { textAlign: "center", marginTop: 8 },
  stats: { flexDirection: "row", alignItems: "center", backgroundColor: colors.okTint, borderWidth: 1, borderColor: colors.okBorder, borderRadius: radius.lg, paddingHorizontal: 26, paddingVertical: 16, marginTop: 22 },
  stat: { alignItems: "center" },
  vline: { width: 1, height: 46, backgroundColor: colors.okBorder, marginHorizontal: 26 },
  tabular: { fontVariant: ["tabular-nums"] },
  note: { marginTop: 16, lineHeight: 20 },
  actions: { width: "100%", alignSelf: "center", gap: 10, paddingBottom: 20 },
  leave: { alignItems: "center", marginTop: 2 },
});
