// التقييم: Rating ("★ 4.8 (214)")، Stars (عرض)، StarInput (اختيار — 40 في فريم 31 و 18 للتفاصيل)، RatingBar (فريم 23)
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { colors, radius } from "@/styles/tokens";

export function Rating({ value, count }: { value: number; count?: number }) {
  const t = useTranslations("mobile.a11y");
  const f = useFormat();
  return (
    <View style={styles.row} accessible accessibilityLabel={t("rating", { value: f.rating(value), count: f.count(count ?? 0) })}>
      <Icon name="star_filled" size={14} color={colors.rating} />
      <Text dense variant="metaStrong" size={13}>
        {f.rating(value)}
      </Text>
      {count !== undefined && (
        <Text dense variant="meta" size={12}>
          ({f.count(count)})
        </Text>
      )}
    </View>
  );
}

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const t = useTranslations("mobile.a11y");
  return (
    <View style={styles.stars} accessible accessibilityLabel={t("stars", { count: value })}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star_filled" size={size} color={i <= Math.round(value) ? colors.rating : colors.line} />
      ))}
    </View>
  );
}

export function StarInput({ value, onChange, size = 40 }: { value: number; onChange: (v: number) => void; size?: 40 | 18 }) {
  const t = useTranslations("mobile.a11y");
  return (
    <View style={[styles.stars, { gap: size === 40 ? 8 : 4 }]} accessibilityRole="adjustable" accessibilityValue={{ min: 0, max: 5, now: value }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Pressable
          key={i}
          onPress={() => onChange(i)}
          accessibilityLabel={t("stars", { count: i })}
          accessibilityState={{ selected: i === value }}
          visualSize={{ width: size, height: size }}
        >
          <Icon name="star_filled" size={size} color={i <= value ? colors.rating : colors.line} />
        </Pressable>
      ))}
    </View>
  );
}

/** "جودة القصة 4.9" + شريط بالنسبة. warn = لون أصفر للبند الضعيف (دقة الوقت في التصميم) */
export function RatingBar({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  const f = useFormat();
  return (
    <View style={styles.bar}>
      <Text variant="label" style={styles.barLabel} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${(value / 5) * 100}%`, backgroundColor: warn ? colors.warn : colors.teal }]} />
      </View>
      <Text dense variant="metaStrong" style={styles.barValue}>
        {f.rating(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 4 },
  stars: { flexDirection: "row", alignItems: "center", gap: 2 },
  bar: { flexDirection: "row", alignItems: "center", gap: 10 },
  barLabel: { width: 96 },
  track: { flex: 1, height: 6, borderRadius: radius.pill, backgroundColor: colors.surf, overflow: "hidden" },
  fill: { height: "100%", borderRadius: radius.pill },
  barValue: { minWidth: 26 },
});
