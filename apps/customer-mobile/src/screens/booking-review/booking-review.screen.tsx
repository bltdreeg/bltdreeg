// راجع الحجز (فريم 25): الصالون، الخدمات، الحلاق ("غيّر" = رجوع)، المعاد ("غيّر" = خطوة ١)، الانتظار كمدى مش وعد
// (أو الميعاد)، السياسة قبل التأكيد، الإجمالي. التأكيد: request id واحد للشاشة (الضغط المتكرر مايعملش حجزين)،
// بعد النجاح المسودة بتتمسح والشاشة بتتبدل بـ "دخلت".
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { Notice } from "@/components/molecules/notice";
import { GroupLabel } from "@/components/molecules/settings-group";
import { LiveIndicator } from "@/components/molecules/status-badges";
import { BookingStep } from "@/components/organs/booking-step";
import { salonName, SalonThumb } from "@/components/organs/salon-card";
import { useBookingLabels, useConfirmBooking } from "@/lib/hooks/booking";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useOnline } from "@/lib/hooks/use-online.hook";
import type { SalonPage } from "@/lib/types/salon";
import type { DraftService } from "@/lib/utils/booking-draft";
import { quoteBooking, TURN_GRACE_MS, travelMinutes } from "@/lib/utils/booking/booking-pricing";
import { waitRange } from "@/lib/utils/format/wait-status.utils";
import { colors, radius } from "@/styles/tokens";

function Line({ label, amount, tone }: { label: string; amount: string; tone?: "discount" | "total" }) {
  const total = tone === "total";
  const color = tone === "discount" ? colors.okDark : total ? colors.textPrimary : colors.textSecondary;
  return (
    <View style={[styles.line, total && styles.totalLine]}>
      <Text variant={total ? "titleMd" : "label"} weight={tone === "discount" ? "bold" : undefined} color={color} style={styles.shrink}>
        {label}
      </Text>
      <Text variant={total ? "titleMd" : "label"} weight={tone === "discount" ? "bold" : undefined} color={color}>
        {amount}
      </Text>
    </View>
  );
}

/** "غيّر" المعاد = ارجع لخطوة ١ (الحلاق بيتختار تاني: مين فاضي بيتغير مع الوقت) */
const pickTime = (salonId: string) => router.dismissTo({ pathname: "/salon/[salonId]/book/slot", params: { salonId } });

interface StepProps {
  page: SalonPage;
  draft: DraftService[];
  barberId: string | null;
  /** ISO — null = دلوقتي */
  startAt: string | null;
}

function Review({ page, draft, barberId, startAt }: StepProps) {
  const t = useTranslations("mobile.booking");
  const tBarber = useTranslations("mobile.booking.barber");
  const f = useFormat();
  const labels = useBookingLabels();
  const online = useOnline();
  const s = page.summary;
  const named = page.barbers.find((b) => b.id === barberId);
  const load = named?.queue ?? s.queue;
  const range = waitRange(load.waitMinutes);
  const minutes = draft.reduce((sum, x) => sum + x.durationMinutes, 0);
  const quote = quoteBooking(draft, page.offers);
  const row = (child: ReactNode, key: string, last = false) => (
    <View key={key} style={[styles.row, !last && styles.rowDivider]}>
      {child}
    </View>
  );

  return (
    <>
      <View style={styles.salon}>
        <SalonThumb size={58} />
        <View style={styles.main}>
          <Text variant="itemTitle" numberOfLines={1}>
            {salonName(s.name)}
          </Text>
          <Text dense variant="meta">{f.digits(page.address)}</Text>
          <Text dense variant="meta">{t("review.drive", { km: f.distance(s.distanceKm), minutes: f.count(travelMinutes(s.distanceKm)) })}</Text>
        </View>
      </View>

      <View style={styles.group}>
        <GroupLabel>{t("review.services")}</GroupLabel>
      </View>
      {draft.map((x) =>
        row(
          <>
            <View style={styles.main}>
              <Text variant="bodyStrong">{x.name}</Text>
              <Text dense variant="meta">
                {f.minutes(x.durationMinutes)}
              </Text>
            </View>
            <Text variant="bodyStrong">{f.price(x.price)}</Text>
          </>,
          x.id,
        ),
      )}
      {row(
        <>
          <Icon name="user" size={20} color={colors.textSecondary} />
          <Text variant="body" style={styles.main}>
            {t("review.barber")}
          </Text>
          <Text variant="bodyStrong" size={14} numberOfLines={1} style={styles.shrink}>
            {named?.name ?? tBarber("anyTitle")}
          </Text>
          <LinkButton label={t("review.change")} onPress={() => router.back()} size={13} />
        </>,
        "barber",
      )}
      {row(
        <>
          <Icon name="calendar" size={20} color={colors.textSecondary} />
          <Text variant="body" style={styles.main}>
            {t("review.time")}
          </Text>
          <Text variant="bodyStrong" size={14} numberOfLines={1} style={styles.shrink}>
            {labels.timing(startAt)}
          </Text>
          <LinkButton label={t("review.change")} onPress={() => pickTime(page.summary.id)} size={13} />
        </>,
        "time",
        true,
      )}

      <View style={styles.wait} accessibilityLiveRegion="polite">
        <View style={styles.waitTop}>
          <Icon name={startAt ? "calendar" : "clock"} size={20} color={colors.tealDark} />
          <View style={styles.main}>
            <Text variant="bodyStrong" weight="extrabold" color={colors.tealDark}>
              {startAt
                ? t("review.slotTitle", { day: labels.day(startAt), time: f.time(startAt) })
                : range.max === 0
                  ? t("review.waitRightIn")
                  : t("review.waitRange", { min: f.number(range.min), max: f.number(range.max) })}
            </Text>
            <Text dense variant="metaStrong" weight="semibold" color={colors.tealDark}>
              {startAt
                ? t("slot.duration", { n: f.number(minutes) })
                : t("review.aheadAndDuration", { count: load.peopleAhead, n: f.count(load.peopleAhead), minutes: f.number(minutes) })}
            </Text>
          </View>
          {!startAt && online && <LiveIndicator />}
        </View>
        <Text variant="metaStrong" weight="semibold" color={colors.tealDark} style={styles.waitNote}>
          {startAt ? t("review.arriveNote", { n: f.count(5) }) : t("review.liveNote")}
        </Text>
      </View>

      <View style={styles.policy}>
        <Notice tone="warning">{startAt ? t("review.policySlot", { n: f.count(10) }) : t("review.policy", { n: f.count(TURN_GRACE_MS / 60_000) })}</Notice>
      </View>

      <View style={styles.totals}>
        <Line label={t("review.subtotal")} amount={f.price(quote.subtotal)} />
        {quote.discounts.map((d) => (
          <Line key={d.offerId} label={t("review.bundle")} amount={f.price(f.ltr(`−${d.amount}`))} tone="discount" />
        ))}
        <Line label={t("review.total")} amount={f.price(quote.total)} tone="total" />
        <Text dense variant="caption" style={styles.cash}>
          {t("review.cash")}
        </Text>
      </View>
    </>
  );
}

function ConfirmFooter({ page, draft, barberId, startAt }: StepProps) {
  const salonId = page.summary.id;
  const t = useTranslations("mobile.booking");
  const tOffline = useTranslations("mobile.offline");
  const online = useOnline();
  const confirm = useConfirmBooking();
  // ponytail: id عشوائي كفاية للـ idempotency في الجلسة — uuid لو الباك إند طلب
  const [requestId] = useState(() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`);
  const error = confirm.error;
  const existingId = typeof error?.data.booking_id === "string" ? error.data.booking_id : null;
  const blocked = error?.code === "booking.already_in_queue";

  let notice: ReactNode = null;
  if (error) {
    const message =
      error.code === "booking.already_in_queue"
        ? t("errors.alreadyInQueue")
        : error.code === "booking.barber_unavailable"
          ? t("errors.barberUnavailable")
          : error.code === "booking.salon_closed"
            ? t("errors.salonClosed")
            : error.code === "booking.slot_taken"
              ? t("errors.slotTaken")
              : t("errors.generic");
    const action = existingId ? (
      <LinkButton label={t("trackTurn")} onPress={() => router.replace({ pathname: "/queue/[bookingId]", params: { bookingId: existingId } })} />
    ) : error.code === "booking.barber_unavailable" ? (
      <LinkButton label={t("pickBarber")} onPress={() => router.back()} />
    ) : error.code === "booking.slot_taken" || error.code === "booking.salon_closed" ? (
      <LinkButton label={t("pickTime")} onPress={() => pickTime(salonId)} />
    ) : undefined;
    notice = (
      <Notice tone="danger" action={action}>
        {message}
      </Notice>
    );
  } else if (!online) {
    notice = (
      <Notice tone="warning" icon="wifi_off">
        {tOffline("queueBlocked")}
      </Notice>
    );
  }

  // mutateAsync مش mutate: مسح المسودة بيشيل الفوتر ده، وcallbacks بتاعة mutate مابتشتغلش بعد الـ unmount
  const submit = () =>
    confirm.mutateAsync({ requestId, salonId, serviceIds: draft.map((s) => s.id), barberId, startAt }).then(
      (b) => {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // الرحلة اتقفلت: الرجوع من "دخلت" يروح للرئيسية مش لخطوات فاضية
        router.dismissAll();
        router.push({ pathname: "/booking/[bookingId]/confirmed", params: { bookingId: b.id } });
      },
      () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
    );

  return (
    <>
      {notice}
      <Button label={startAt ? t("review.confirmSlot") : t("review.confirm")} size="xl" loading={confirm.isPending} disabled={!online || blocked} onPress={submit} />
    </>
  );
}

export default function BookingReviewScreen() {
  const t = useTranslations("mobile.screens");
  const { salonId, barber, start } = useLocalSearchParams<{ salonId: string; barber?: string; start?: string }>();
  const barberId = barber ?? null;
  const startAt = start ?? null;

  return (
    <BookingStep
      salonId={salonId}
      title={t("bookingReview")}
      step={3}
      footer={(page, draft) => <ConfirmFooter page={page} draft={draft} barberId={barberId} startAt={startAt} />}
    >
      {(page, draft) => <Review page={page} draft={draft} barberId={barberId} startAt={startAt} />}
    </BookingStep>
  );
}

const styles = StyleSheet.create({
  salon: { flexDirection: "row", gap: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  main: { flex: 1, minWidth: 0 },
  shrink: { flexShrink: 1 },
  group: { marginTop: 16 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.line },
  wait: { backgroundColor: colors.tealTint, borderRadius: radius.md, padding: 14, marginTop: 16 },
  waitTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  waitNote: { borderTopWidth: 1, borderTopColor: colors.tealDivider, paddingTop: 10, marginTop: 10, lineHeight: 21 },
  policy: { marginTop: 12 },
  totals: { borderTopWidth: 1, borderTopColor: colors.line, marginTop: 18, paddingTop: 14 },
  line: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 7 },
  totalLine: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 9, marginTop: 2, marginBottom: 0 },
  cash: { marginTop: 6 },
});
