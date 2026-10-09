// اختار الحلاق (فريم 24): "أي حلاق متاح" مختار من الأول ومعلّم الأسرع؛ كل حلاق بالاسم بيقول تكلفته (دقايق زيادة).
// في الميعاد: مين فاضي فيه (free من الخطوة اللي فاتت، السيرفر بيتأكد تاني). الاختيار بيروح للمراجعة كـ param
// (barber، من غيره = أي حلاق) — زي BookingBarberPage في Flutter.
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Avatar } from "@/components/atoms/avatar";
import { Icon } from "@/components/atoms/icon";
import { RadioCard, RadioDot, RadioGroup } from "@/components/atoms/selection-controls";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { Notice } from "@/components/molecules/notice";
import { GroupLabel } from "@/components/molecules/settings-group";
import { BookingStep } from "@/components/organs/booking-step";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { SalonBarber, SalonPage } from "@/lib/types/salon";
import { colors, radius } from "@/styles/tokens";

const ANY = "any";

function Trailing({ value, caption, color = colors.textPrimary, captionColor = colors.textSecondary }: { value: string; caption: string; color?: string; captionColor?: string }) {
  return (
    <View style={styles.trailing}>
      <Text dense variant="bodyStrong" size={13.5} weight="extrabold" color={color}>
        {value}
      </Text>
      <Text dense variant="caption" color={captionColor}>
        {caption}
      </Text>
    </View>
  );
}

/** الميعاد اللي اتختار في الخطوة ١ — null = دلوقتي */
interface Slot {
  start: string;
  free: string[];
}

function AnyOption({ page, selected, slot }: { page: SalonPage; selected: boolean; slot: Slot | null }) {
  const t = useTranslations("mobile.booking.barber");
  const f = useFormat();
  const q = page.summary.queue;
  return (
    <RadioCard value={ANY} accessibilityLabel={t("anyTitle")} style={[styles.card, selected && styles.selected]}>
      <RadioDot />
      <View style={styles.main}>
        <View style={styles.nameRow}>
          <Text variant="bodyStrong" size={15} weight="extrabold" color={selected ? colors.tealDark : colors.textPrimary}>
            {t("anyTitle")}
          </Text>
          {!slot && (
            <View style={styles.fastest}>
              <Text dense variant="micro" weight="extrabold" color={colors.onPrimary}>
                {t("fastest")}
              </Text>
            </View>
          )}
        </View>
        <Text dense variant="metaStrong" weight="semibold" color={selected ? colors.tealDark : colors.textSecondary}>
          {slot ? t("anySlotSubtitle") : t("anySubtitle")}
        </Text>
      </View>
      {slot ? null : q.peopleAhead === 0 ? (
        <Trailing value={t("immediate")} caption={t("noQueue")} color={colors.okDark} captionColor={colors.okText2} />
      ) : (
        <Trailing value={t("approx", { n: f.ltr(`~${q.waitMinutes}`) })} caption={t("aheadOfYou", { n: f.count(q.peopleAhead) })} />
      )}
    </RadioCard>
  );
}

function BarberOption({ barber, salonWait, selected, slot }: { barber: SalonBarber; salonWait: number; selected: boolean; slot: Slot | null }) {
  const t = useTranslations("mobile.booking.barber");
  const f = useFormat();
  const q = barber.queue;
  const off = slot ? !slot.free.includes(barber.id) : q === null;
  const note = off ? (slot ? t("busyAtSlot") : t("offToday")) : barber.specialty;

  let trailing = null;
  if (slot) trailing = off ? null : <Trailing value={t("free")} caption={f.time(slot.start)} color={colors.okDark} />;
  else if (q?.peopleAhead === 0) trailing = <Trailing value={t("immediate")} caption={t("free")} color={colors.okDark} />;
  else if (q) {
    const extra = q.waitMinutes - salonWait;
    trailing = (
      <Trailing
        value={extra > 0 ? t("extra", { n: f.ltr(`+${extra}`) }) : t("approx", { n: f.ltr(`~${q.waitMinutes}`) })}
        caption={t("aheadOfBarber", { n: f.count(q.peopleAhead) })}
        color={extra > 0 ? colors.warnText : colors.textPrimary}
      />
    );
  }

  return (
    <RadioCard value={barber.id} disabled={off} accessibilityLabel={barber.name} style={[styles.card, selected && styles.selected, off && styles.off]}>
      <RadioDot disabled={off} />
      <Avatar name={barber.name} size={42} tone="surface" />
      <View style={styles.main}>
        <View style={styles.nameRow}>
          <Text variant="bodyStrong" numberOfLines={1} style={styles.shrink}>
            {barber.name}
          </Text>
          {!off && barber.rating !== null && (
            <View style={styles.rating}>
              <Icon name="star_filled" size={14} color={colors.rating} />
              <Text dense variant="metaStrong" size={13}>
                {f.rating(barber.rating)}
              </Text>
            </View>
          )}
        </View>
        <Text dense variant="meta" numberOfLines={1}>
          {note}
        </Text>
      </View>
      {trailing}
    </RadioCard>
  );
}

export default function BookingBarberScreen() {
  const t = useTranslations("mobile");
  const { salonId, start, free, barber } = useLocalSearchParams<{ salonId: string; start?: string; free?: string; barber?: string }>();
  const slot: Slot | null = start ? { start, free: free ? free.split(",") : [] } : null;
  // "احجز تاني" بيبدأ على نفس الحلاق (لو لسه فاضي — السيرفر بيتأكد)
  const [selected, setSelected] = useState(barber ?? ANY);

  return (
    <BookingStep
      salonId={salonId}
      title={t("screens.bookingBarber")}
      step={2}
      footer={() => (
        <Button
          label={t("booking.barber.continue")}
          onPress={() => router.push({ pathname: "/salon/[salonId]/book/review", params: { salonId, ...(start && { start }), ...(selected !== ANY && { barber: selected }) } })}
        />
      )}
    >
      {(page) => (
        <RadioGroup value={selected} onValueChange={setSelected}>
          <AnyOption page={page} selected={selected === ANY} slot={slot} />
          <View style={styles.label}>
            <GroupLabel>{t("booking.barber.byName")}</GroupLabel>
          </View>
          {page.barbers.map((b) => (
            <BarberOption key={b.id} barber={b} salonWait={page.summary.queue.waitMinutes} selected={selected === b.id} slot={slot} />
          ))}
          {!slot && (
            <View style={styles.note}>
              <Notice>{t("salon.barberNamedNote")}</Notice>
            </View>
          )}
        </RadioGroup>
      )}
    </BookingStep>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, marginBottom: 10, borderRadius: radius.card, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
  // الحد ٢ بدل ١ — الـ padding بيقل واحد عشان المحتوى مايتحركش
  selected: { borderWidth: 2, padding: 13, borderColor: colors.teal, backgroundColor: colors.tealTint },
  off: { opacity: 0.55 },
  main: { flex: 1, minWidth: 0, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  shrink: { flexShrink: 1 },
  fastest: { backgroundColor: colors.teal, borderRadius: radius.xs, paddingHorizontal: 7, paddingVertical: 2 },
  rating: { flexDirection: "row", alignItems: "center", gap: 3 },
  trailing: { alignItems: "flex-end" },
  label: { marginTop: 6 },
  note: { marginTop: 6 },
});
