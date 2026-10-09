// امتى تحب تيجي؟ (خطوة ١ من ٣ — من Flutter، GAPS D7): ادخل الطابور دلوقتي، أو اختار يوم وساعة على قد خدماتك.
// الصالون مقفول → "احجز معاد" على طول. الاختيار بيروح للحلاق كـ param (start، من غيره = دلوقتي).
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { RadioCard, RadioDot, RadioGroup } from "@/components/atoms/selection-controls";
import { Skeleton } from "@/components/atoms/skeleton";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { DateChip } from "@/components/molecules/chip";
import { Notice } from "@/components/molecules/notice";
import { LiveIndicator } from "@/components/molecules/status-badges";
import { BookingStep } from "@/components/organs/booking-step";
import { useDaySchedule } from "@/lib/hooks/booking";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { TimeSlot } from "@/lib/types/booking";
import type { SalonPage } from "@/lib/types/salon";
import { colors, radius } from "@/styles/tokens";
import { dayMs, nextDays } from "@/lib/utils/day-keys";
import { groupSlots, isClosedOn, type Period } from "./__lib/slot-groups";

type Mode = "now" | "schedule";
const PERIOD_ICON: Record<Period, IconName> = { morning: "sun", afternoon: "sunset", evening: "moon" };

/** الوضع واليوم الفعليين: مقفول دلوقتي → ميعاد؛ اليوم المقفول → أول يوم مفتوح */
function resolve(page: SalonPage, mode: Mode | null, day: string | null, now: number) {
  const canJoinNow = page.summary.opensAt === null;
  const days = nextDays(now);
  const open = (d: string) => !isClosedOn(d, page.hours);
  const effectiveMode: Mode = mode === "schedule" || !canJoinNow ? "schedule" : "now";
  const effectiveDay = day && open(day) ? day : (days.find(open) ?? days[0]);
  return { canJoinNow, days, mode: effectiveMode, day: effectiveDay };
}

function SlotChip({ label, selected, available, onPress }: { label: string; selected: boolean; available: boolean; onPress: () => void }) {
  const t = useTranslations("mobile.booking.slot");
  const fg = !available ? colors.textDisabled : selected ? colors.onPrimary : colors.textPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={!available}
      accessibilityRole="togglebutton"
      accessibilityLabel={available ? label : t("taken", { time: label })}
      accessibilityState={{ selected, disabled: !available }}
      style={[styles.slot, !available && styles.slotOff, selected && styles.slotOn]}
    >
      <Text dense variant="label" size={13.5} weight="bold" color={fg} style={!available && styles.strike}>
        {label}
      </Text>
    </Pressable>
  );
}

function SchedulePicker({ page, minutes, days, day, onDay, picked, onPick }: { page: SalonPage; minutes: number; days: string[]; day: string; onDay: (d: string) => void; picked: string | null; onPick: (s: TimeSlot) => void }) {
  const t = useTranslations("mobile.booking.slot");
  const tOffline = useTranslations("mobile.offline");
  const f = useFormat();
  const { gutter } = useResponsive();
  const q = useDaySchedule(page.summary.id, day, minutes);
  const closed = isClosedOn(day, page.hours);

  let body;
  if (q.data) {
    if (!q.data.slots.length && closed) body = <Notice>{t("dayClosed")}</Notice>;
    else if (!q.data.slots.some((s) => s.freeBarberIds.length)) body = <Notice>{t("dayFull")}</Notice>;
    else
      body = groupSlots(day, q.data.slots).map(([period, slots]) => (
        <View key={period} style={styles.period}>
          <View style={styles.periodLabel}>
            <Icon name={PERIOD_ICON[period]} size={15} color={colors.textSecondary} />
            <Text dense variant="groupLabel">
              {t(period)}
            </Text>
          </View>
          <View style={styles.grid}>
            {slots.map((s) => (
              <View key={s.start} style={styles.cell}>
                <SlotChip label={f.time(s.start)} selected={s.start === picked} available={s.freeBarberIds.length > 0} onPress={() => onPick(s)} />
              </View>
            ))}
          </View>
        </View>
      ));
  } else if (q.isError) {
    body = (
      <Notice tone="danger" action={<LinkButton label={tOffline("retry")} onPress={() => void q.refetch()} />}>
        {t("loadFailed")}
      </Notice>
    );
  } else {
    body = (
      <View style={styles.grid} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {Array.from({ length: 9 }, (_, i) => (
          <View key={i} style={styles.cell}>
            <Skeleton height={42} radius={radius.field} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.picker}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -gutter }} contentContainerStyle={[styles.days, { paddingHorizontal: gutter }]}>
        {days.map((d, i) => (
          <DateChip
            key={d}
            top={i === 0 ? t("today") : i === 1 ? t("tomorrow") : f.weekday(new Date(dayMs(d)).toISOString())}
            bottom={f.dayMonth(new Date(dayMs(d)).toISOString())}
            selected={d === day}
            disabled={isClosedOn(d, page.hours)}
            onPress={() => onDay(d)}
          />
        ))}
      </ScrollView>
      <View style={styles.slots}>{body}</View>
      <Text dense variant="caption" weight="semibold">
        {t("duration", { n: f.number(minutes) })}
      </Text>
    </View>
  );
}

export default function BookingSlotScreen() {
  const t = useTranslations("mobile");
  const f = useFormat();
  const online = useOnline();
  // barber: من "احجز تاني" — بيتشال للخطوة الجاية
  const { salonId, barber } = useLocalSearchParams<{ salonId: string; barber?: string }>();
  const [mode, setMode] = useState<Mode | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [picked, setPicked] = useState<TimeSlot | null>(null);
  const [now] = useState(Date.now);

  return (
    <BookingStep
      salonId={salonId}
      title={t("screens.bookingSlot")}
      step={1}
      footer={(page) => {
        const r = resolve(page, mode, day, now);
        const ready = r.mode === "now" ? r.canJoinNow : picked !== null;
        return (
          <Button
            label={t("booking.slot.continue")}
            disabled={!ready}
            onPress={() => router.push({ pathname: "/salon/[salonId]/book/barber", params: { salonId, ...(barber && { barber }), ...(r.mode === "schedule" && { start: picked!.start, free: picked!.freeBarberIds.join(",") }) } })}
          />
        );
      }}
    >
      {(page, draft) => {
        const r = resolve(page, mode, day, now);
        const q = page.summary.queue;
        const minutes = draft.reduce((sum, s) => sum + s.durationMinutes, 0);
        const nowSubtitle = !r.canJoinNow
          ? t("booking.slot.nowClosed")
          : online
            ? t("booking.slot.nowWait", { count: q.peopleAhead, n: f.count(q.peopleAhead), min: f.ltr(`~${q.waitMinutes}`) })
            : t("offline.waitStale");
        return (
          <RadioGroup value={r.mode} onValueChange={(v) => setMode(v as Mode)}>
            <RadioCard value="now" disabled={!r.canJoinNow} accessibilityLabel={t("booking.slot.nowTitle")} style={[styles.card, r.mode === "now" && styles.selected, !r.canJoinNow && styles.off]}>
              <RadioDot disabled={!r.canJoinNow} />
              <View style={styles.main}>
                <Text variant="bodyStrong" size={15} weight="extrabold">
                  {t("booking.slot.nowTitle")}
                </Text>
                <Text dense variant="metaStrong" weight="semibold" color={colors.textSecondary}>
                  {nowSubtitle}
                </Text>
              </View>
              {online && r.canJoinNow && <LiveIndicator />}
            </RadioCard>
            <RadioCard value="schedule" accessibilityLabel={t("booking.slot.scheduleTitle")} style={[styles.card, r.mode === "schedule" && styles.selected]}>
              <RadioDot />
              <View style={styles.main}>
                <Text variant="bodyStrong" size={15} weight="extrabold">
                  {t("booking.slot.scheduleTitle")}
                </Text>
                <Text dense variant="metaStrong" weight="semibold" color={colors.textSecondary}>
                  {t("booking.slot.scheduleSubtitle")}
                </Text>
              </View>
            </RadioCard>
            {r.mode === "schedule" && (
              <SchedulePicker
                page={page}
                minutes={minutes}
                days={r.days}
                day={r.day}
                onDay={setDay}
                picked={picked?.start ?? null}
                onPick={setPicked}
              />
            )}
          </RadioGroup>
        );
      }}
    </BookingStep>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 10, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
  selected: { borderWidth: 2, padding: 13, borderColor: colors.teal, backgroundColor: colors.tealTint },
  off: { opacity: 0.55 },
  main: { flex: 1, minWidth: 0, gap: 3 },
  picker: { marginTop: 6 },
  days: { gap: 8 },
  slots: { marginTop: 18, marginBottom: 14 },
  period: { marginBottom: 16 },
  periodLabel: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  // ٣ عواميد بفرق ٨: كل خانة ثلث العرض وحواليها ٤
  grid: { flexDirection: "row", flexWrap: "wrap", marginHorizontal: -4 },
  cell: { width: "33.333%", padding: 4 },
  slot: { height: 42, borderRadius: radius.field, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  slotOff: { backgroundColor: colors.surf },
  slotOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  strike: { textDecorationLine: "line-through" },
});
