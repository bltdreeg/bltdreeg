// صناديق المعلومة والتنبيه: Notice (رمادي info / teal / أخضر / أصفر / أحمر) و OfflineBar (فريم 08)
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, radius, tone as tones, type Tone } from "@/styles/tokens";

interface Props {
  tone?: Tone;
  icon?: IconName;
  title?: string;
  children?: ReactNode;
  /** link/button under the text */
  action?: ReactNode;
}

/** neutral = صندوق الـ info الرمادي (surf + border، نص 13 رمادي)؛ الباقي بانرات ملوّنة */
export function Notice({ tone = "neutral", icon = "alert_circle", title, children, action }: Props) {
  const t = tones[tone];
  const neutral = tone === "neutral";
  return (
    <View style={[styles.root, { backgroundColor: t.background }, neutral && styles.neutral]}>
      <Icon name={icon} size={neutral ? 15 : 18} color={neutral ? colors.textSecondary : t.foreground} />
      <View style={styles.body}>
        {title && (
          <Text variant="bodyStrong" weight="extrabold" color={t.foreground}>
            {title}
          </Text>
        )}
        {typeof children === "string" ? (
          <Text variant="note" color={neutral ? colors.textSecondary : t.foreground} weight={neutral ? "medium" : "semibold"}>
            {children}
          </Text>
        ) : (
          children
        )}
        {action}
      </View>
    </View>
  );
}

/** شريط "مفيش نت — الأرقام دي آخر تحديث الساعة 9:32" + "جرّب تاني" */
export function OfflineBar({ updatedAt, onRetry }: { updatedAt?: string; onRetry?: () => void }) {
  const t = useTranslations("mobile.offline");
  const { gutter } = useResponsive();
  return (
    <View style={[styles.offline, { paddingHorizontal: gutter }]} accessibilityRole="alert" accessibilityLiveRegion="polite">
      <Icon name="wifi_off" size={15} color={colors.warnText} />
      <Text dense variant="metaStrong" color={colors.warnText} style={styles.body}>
        {updatedAt ? t("barWithTime", { time: updatedAt }) : t("bar")}
      </Text>
      {onRetry && (
        <Pressable onPress={onRetry} accessibilityLabel={t("retry")} hitSlop={12}>
          <Text dense variant="metaStrong" color={colors.warnText} style={styles.underline}>
            {t("retry")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: radius.md, padding: 14 },
  neutral: { borderRadius: radius.card, borderWidth: 1, borderColor: colors.border },
  body: { flex: 1, gap: 4 },
  offline: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 9, backgroundColor: colors.warnTint, borderBottomWidth: 1, borderBottomColor: colors.warnBorder },
  underline: { textDecorationLine: "underline" },
});
