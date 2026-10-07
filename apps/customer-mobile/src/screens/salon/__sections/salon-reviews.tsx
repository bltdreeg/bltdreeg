// التقييمات (فريم 23): الملخص + ٣ بنود ("دقة الوقت" بند مستقل)، فلاتر، كروت برد الصالون. وبعدها مواعيد العمل.
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Avatar } from "@/components/atoms/avatar";
import { Text } from "@/components/atoms/text";
import { Chip, ChipRail } from "@/components/molecules/chip";
import { RatingBar, Stars } from "@/components/molecules/rating";
import { ListGroup } from "@/components/molecules/settings-group";
import { Badge } from "@/components/molecules/status-badges";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import type { DayHours, SalonPage, SalonReview } from "@/lib/types/salon";
import { timeAgo } from "@/lib/utils/format/time-ago.utils";
import { colors, radius } from "@/styles/tokens";
import { filterReviews, hoursFromToday, timeOfDayIso, type ReviewFilter } from "../__lib/salon-labels";

const WARN_BELOW = 4.5;
type DayKey = "d0" | "d1" | "d2" | "d3" | "d4" | "d5" | "d6";

function ReviewCard({ review, now }: { review: SalonReview; now: number }) {
  const t = useTranslations("mobile.salon");
  const tAgo = useTranslations("mobile.common.timeAgo");
  const f = useFormat();
  const ago = timeAgo(review.createdAt, now);
  return (
    <View style={styles.review}>
      <View style={styles.reviewHead}>
        <Avatar name={review.authorName} size={36} tone="surface" />
        <View style={styles.flex}>
          <Text variant="bodyStrong" size={14}>
            {review.authorName}
          </Text>
          <Stars value={review.stars} size={12} />
        </View>
        <Text variant="caption">{tAgo(ago.unit, { count: ago.count, n: f.count(ago.count) })}</Text>
      </View>
      <Text variant="bodySm" color={colors.textPrimary}>
        {f.digits(review.text)}
      </Text>
      {(review.serviceName || review.barberName) && (
        <View style={styles.tags}>
          {review.serviceName && <Badge label={review.serviceName} />}
          {review.barberName && <Badge label={review.barberName} />}
        </View>
      )}
      {review.salonReply && (
        <View style={styles.reply}>
          <Text variant="metaStrong" weight="extrabold" color={colors.tealDark}>
            {t("salonReply")}
          </Text>
          <Text variant="meta">{review.salonReply}</Text>
        </View>
      )}
    </View>
  );
}

export function SalonReviews({ page, now }: { page: SalonPage; now: number }) {
  const t = useTranslations("mobile.salon");
  const f = useFormat();
  const { gutter } = useResponsive();
  const [filter, setFilter] = useState<ReviewFilter>({ kind: "all" });
  const { summary: s, ratingBreakdown: b, reviews } = page;

  if (s.rating === null || !b) {
    return (
      <Text variant="note" style={styles.empty}>
        {t("reviewsEmpty")}
      </Text>
    );
  }

  const barbers = page.barbers.filter((x) => reviews.some((r) => r.barberId === x.id));
  const chips: { label: string; value: ReviewFilter }[] = [
    { label: t("filterAll"), value: { kind: "all" } },
    { label: t("filterFive", { n: f.count(5) }), value: { kind: "five" } },
    { label: t("filterPhotos"), value: { kind: "photos" } },
    ...barbers.map((x) => ({ label: x.name, value: { kind: "barber", barberId: x.id } as ReviewFilter })),
  ];
  const same = (a: ReviewFilter, c: ReviewFilter) => a.kind === c.kind && (a.kind !== "barber" || (c.kind === "barber" && a.barberId === c.barberId));
  const shown = filterReviews(reviews, filter);

  return (
    <View style={styles.root}>
      <View style={styles.summary}>
        <View style={styles.score}>
          <Text variant="displayXs" size={34}>
            {f.rating(s.rating)}
          </Text>
          <Stars value={s.rating} size={13} />
          <Text variant="caption">{t("reviewsTotal", { count: s.reviewsCount, n: f.count(s.reviewsCount) })}</Text>
        </View>
        <View style={styles.bars}>
          {(
            [
              [t("quality"), b.quality],
              [t("cleanliness"), b.cleanliness],
              [t("timeAccuracy"), b.timeAccuracy],
            ] as const
          ).map(([label, value]) => (
            <RatingBar key={label} label={label} value={value} warn={value < WARN_BELOW} />
          ))}
        </View>
      </View>
      <View style={[styles.chips, { marginHorizontal: -gutter }]}>
        <ChipRail>
          {chips.map((c) => (
            <Chip key={c.label} label={c.label} height={32} kind={same(filter, c.value) ? "selected" : "default"} onPress={() => setFilter(c.value)} />
          ))}
        </ChipRail>
      </View>
      {shown.length === 0 ? (
        <Text variant="note" style={styles.empty}>
          {t("reviewsFilterEmpty")}
        </Text>
      ) : (
        shown.map((r) => <ReviewCard key={r.id} review={r} now={now} />)
      )}
    </View>
  );
}

export function SalonHours({ hours, open, now }: { hours: DayHours[]; open: boolean; now: number }) {
  const t = useTranslations("mobile.salon");
  const tDays = useTranslations("mobile.common.days");
  const f = useFormat();
  return (
    <View>
      <View style={styles.hoursHead}>
        <Text variant="sectionTitle" accessibilityRole="header">
          {t("hoursHeader")}
        </Text>
        {open && <Badge label={t("openNow")} kind="success" />}
      </View>
      <ListGroup>
        {hoursFromToday(hours, now).map((h) => {
          const day = tDays(`d${h.weekday}` as DayKey);
          const off = h.opensAt === null;
          const range = off ? t("dayOff") : t("hoursRange", { from: f.hour(timeOfDayIso(h.opensAt!, now)), to: f.hour(timeOfDayIso(h.closesAt!, now)) });
          return (
            <View key={h.weekday} style={styles.hourRow} accessible accessibilityLabel={`${day}، ${range}`}>
              <Text variant="body" weight={h.today ? "extrabold" : undefined} color={h.today ? colors.teal : off ? colors.textSecondary : colors.textPrimary} style={styles.flex}>
                {h.today ? t("today", { day }) : day}
              </Text>
              <Text variant="label" size={13} weight={h.today ? "bold" : "semibold"} color={off ? colors.error : h.today ? colors.textPrimary : colors.textSecondary}>
                {range}
              </Text>
            </View>
          );
        })}
      </ListGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: 18 },
  flex: { flex: 1 },
  empty: { paddingVertical: 18 },
  summary: { flexDirection: "row", alignItems: "center", gap: 18, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.line },
  score: { alignItems: "center", gap: 3 },
  bars: { flex: 1, gap: 6 },
  // الـ chips بتعدّي حواف الـ gutter زي البورد (ChipRail بيرجّع الـ padding جوه)
  chips: { marginVertical: 14 },
  review: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.line, gap: 8 },
  reviewHead: { flexDirection: "row", alignItems: "center", gap: 10 },
  tags: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  reply: { backgroundColor: colors.surf, borderStartWidth: 2.5, borderStartColor: colors.teal, borderTopEndRadius: radius.sm, borderBottomEndRadius: radius.sm, paddingVertical: 10, paddingHorizontal: 12, gap: 3, marginTop: 2 },
  hoursHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  hourRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 15 },
});
