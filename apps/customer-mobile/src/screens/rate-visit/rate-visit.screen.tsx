// قيّم زيارتك (فريم 31) — زي RateVisitPage في Flutter: بعد completed بس؛ التقييم العام بيملا التفاصيل اللي ما اتلمستش؛
// "دقة الوقت المتوقع" بند لوحده (بيأثر على ترتيب الصالونات). اتقيّمت قبل كده = شاشة "اتبعت" على طول.
import * as Haptics from "expo-haptics";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Checkbox } from "@/components/atoms/selection-controls";
import { Text } from "@/components/atoms/text";
import { Button, LinkButton } from "@/components/molecules/button";
import { Chip } from "@/components/molecules/chip";
import { EmptyState } from "@/components/molecules/empty-state";
import { StarInput } from "@/components/molecules/rating";
import { GroupLabel } from "@/components/molecules/settings-group";
import { TextField } from "@/components/molecules/text-field";
import { useToast } from "@/components/molecules/toast";
import { TopBar } from "@/components/molecules/top-bar";
import { NoConnection } from "@/components/organs/no-connection";
import { Meta, salonName, SalonThumb } from "@/components/organs/salon-card";
import { useBooking, useBookingLabels, useSubmitRating } from "@/lib/hooks/booking";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { QueueBooking } from "@/lib/types/booking";
import { EMPTY_RATING, MAX_RATING_COMMENT, RATING_TAGS, setOverall, type RatingForm } from "@/lib/utils/rating/rating-form";
import { colors, shadow } from "@/styles/tokens";
import { RatingPhotos } from "./__sections/rating-photos";

const leave = () => (router.canGoBack() ? router.back() : router.replace("/"));

function DetailRow({ label, note, value, onChange }: { label: string; note?: string; value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.detail}>
      <View style={styles.flex}>
        <Text variant="body" size={14}>
          {label}
        </Text>
        {note && <Text variant="caption">{note}</Text>}
      </View>
      <StarInput value={value} onChange={onChange} size={18} />
    </View>
  );
}

function Form({ booking: b }: { booking: QueueBooking }) {
  const t = useTranslations("mobile");
  const f = useFormat();
  const labels = useBookingLabels();
  const { gutter, formMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const submit = useSubmitRating(b.id);
  const { toast, show } = useToast();
  const [form, setForm] = useState<RatingForm>(EMPTY_RATING);
  const set = (patch: Partial<RatingForm>) => setForm((x) => ({ ...x, ...patch }));
  const column = { paddingHorizontal: gutter, maxWidth: formMaxWidth };

  const send = () =>
    // النجاح بيحط الحجز المتقيّم في الكاش، والشاشة بتحوّل لـ "اتبعت" لوحدها
    submit.mutateAsync(form).then(
      () => void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
      () => show(t("booking.errors.generic")),
    );

  return (
    <>
      <KeyboardAwareScrollView bottomOffset={24} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, column]}>
        <View style={styles.visit}>
          <SalonThumb size={52} salonId={b.salonId} />
          <View style={styles.visitText}>
            <Text variant="itemTitle" numberOfLines={1}>
              {salonName(b.salonName)}
            </Text>
            <Meta items={[b.services.map((s) => s.name).join(t("queue.servicesJoiner")), b.barberName ?? t("booking.barber.anyTitle")]} />
            <Meta
              items={[
                labels.timing(b.startAt ?? b.createdAt),
                <Text key="price" dense variant="metaStrong" color={colors.textPrimary}>
                  {f.price(b.total)}
                </Text>,
              ]}
            />
          </View>
        </View>

        <View style={styles.overall}>
          <Text variant="bodyStrong" size={15} style={styles.center}>
            {t("rate.overallQuestion")}
          </Text>
          <StarInput value={form.overall} onChange={(stars) => setForm((x) => setOverall(x, stars))} />
          {form.overall > 0 && (
            <Text key={form.overall} variant="bodyStrong" size={14} weight="extrabold" color={colors.teal} style={styles.center}>
              {t(`rate.labels.l${form.overall}` as "rate.labels.l1")}
            </Text>
          )}
        </View>

        <GroupLabel>{t("rate.detailsHeader")}</GroupLabel>
        <DetailRow label={t("rate.quality")} value={form.quality} onChange={(quality) => set({ quality })} />
        <DetailRow label={t("rate.cleanliness")} value={form.cleanliness} onChange={(cleanliness) => set({ cleanliness })} />
        <DetailRow
          label={t("rate.timeAccuracy")}
          note={b.quotedWaitMinutes != null && b.actualWaitMinutes != null ? t("rate.timeAccuracyNote", { quoted: f.number(b.quotedWaitMinutes), actual: f.number(b.actualWaitMinutes) }) : undefined}
          value={form.timeAccuracy}
          onChange={(timeAccuracy) => set({ timeAccuracy })}
        />
        <View style={styles.rule} />

        <GroupLabel>{`${t("rate.tagsHeader")} ${t("a11y.optional")}`}</GroupLabel>
        <View style={styles.tags}>
          {RATING_TAGS.map((tag) => {
            const on = form.tags.includes(tag);
            return (
              <Chip
                key={tag}
                label={t(`rate.tags.${tag}`)}
                height={34}
                kind={on ? "selected" : "default"}
                icon={on ? "check" : undefined}
                onPress={() => set({ tags: on ? form.tags.filter((x) => x !== tag) : [...form.tags, tag] })}
              />
            );
          })}
        </View>

        <TextField
          label={t("rate.commentLabel")}
          optional
          multiline
          maxLength={MAX_RATING_COMMENT}
          placeholder={t("rate.commentHint")}
          value={form.comment}
          onChangeText={(comment) => set({ comment })}
        />
        <RatingPhotos photos={form.photos} onChange={(photos) => set({ photos })} onFailed={() => show(t("rate.photoFailed"))} />
        <View style={styles.anonymous}>
          <Checkbox checked={form.anonymous} onPress={() => set({ anonymous: !form.anonymous })} accessibilityLabel={t("rate.anonymous")} />
          <Text variant="note" style={styles.flex} onPress={() => set({ anonymous: !form.anonymous })}>
            {t("rate.anonymous")}
          </Text>
        </View>
      </KeyboardAwareScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(16, insets.bottom + 8) }]}>
        <View style={[styles.footerInner, column]}>
          <Button label={t("rate.submit")} disabled={form.overall === 0} loading={submit.isPending} onPress={() => void send()} />
        </View>
      </View>
      {toast}
    </>
  );
}

export default function RateVisitScreen() {
  const t = useTranslations("mobile");
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { gutter } = useResponsive();
  const online = useOnline();
  const q = useBooking(bookingId);
  const b = q.data;
  // اتقيّمت دلوقتي أو قبل كده (حجوزاتي، إشعار قديم): التأكيد — زي Flutter
  if (b?.rating != null) return <Redirect href={{ pathname: "/booking/[bookingId]/rate/sent", params: { bookingId: b.id } }} />;

  let content;
  if (b?.status === "completed") content = <Form booking={b} />;
  else if (b)
    content = (
      <EmptyState illustration="rating_sent" illustrationWidth={150} title={t("rate.notAvailableTitle")} message={t("rate.notAvailableBody")}>
        <Button label={t("booking.backHome")} onPress={() => router.replace("/")} />
      </EmptyState>
    );
  else if (!q.isError) content = <ActivityIndicator style={styles.flex} color={colors.teal} />;
  else if (!online) content = <NoConnection onRetry={() => void q.refetch()} retrying={q.isFetching} />;
  else
    content = (
      <EmptyState illustration="empty_bookings" illustrationWidth={170} title={t("booking.errors.loadFailed")} message={t("booking.errors.generic")}>
        <Button label={t("booking.retry")} icon="refresh" onPress={() => void q.refetch()} />
      </EmptyState>
    );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={{ paddingHorizontal: gutter }}>
        <TopBar title={t("screens.rateVisit")} close onBack={leave} trailing={<LinkButton label={t("rate.later")} color={colors.textSecondary} size={14} onPress={leave} />} />
      </View>
      <View style={styles.flex}>{content}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  center: { textAlign: "center", alignSelf: "stretch" },
  content: { width: "100%", alignSelf: "center", paddingTop: 12, paddingBottom: 20 },
  visit: { flexDirection: "row", gap: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  visitText: { flex: 1, minWidth: 0, gap: 3 },
  overall: { alignItems: "center", gap: 12, paddingTop: 22, paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 18 },
  detail: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9 },
  rule: { height: 1, backgroundColor: colors.line, marginTop: 7, marginBottom: 18 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  anonymous: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 14 },
  footer: { borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg, paddingTop: 12, ...shadow.float },
  footerInner: { width: "100%", alignSelf: "center" },
});
