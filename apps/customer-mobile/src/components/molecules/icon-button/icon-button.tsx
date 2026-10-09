// زرار أيقونة مربع (38 / 42 / 48): رجوع، جرس، فلتر، قفل الشيت. outline / filled / active + نقطة غير مقروء أو عدّاد.
import { StyleSheet, View } from "react-native";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { colors, radius, sizes } from "@/styles/tokens";

export type IconButtonStyle = "outline" | "filled" | "active";

interface Props {
  icon: IconName;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: 38 | 42 | 48;
  iconSize?: number;
  variant?: IconButtonStyle;
  iconColor?: string;
  /** flip in RTL (back chevron) */
  mirror?: boolean;
  /** unread dot (bell) */
  dot?: boolean;
  /** active filters count */
  count?: number;
}

const PALETTE: Record<IconButtonStyle, { bg: string; border?: string; fg: string }> = {
  outline: { bg: colors.bg, border: colors.border, fg: colors.textPrimary },
  filled: { bg: colors.surf, fg: colors.textPrimary },
  active: { bg: colors.tealTint, border: colors.primary, fg: colors.tealDark },
};

export function IconButton({ icon, onPress, accessibilityLabel, size = sizes.topBarButton as 38, iconSize = sizes.icon, variant = "outline", iconColor, mirror, dot, count }: Props) {
  const p = PALETTE[variant];
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityLabel={count ? `${accessibilityLabel} (${count})` : accessibilityLabel}
      visualSize={{ width: size, height: size }}
      style={[
        styles.root,
        { width: size, height: size, borderRadius: size >= 42 ? radius.md : radius.field, backgroundColor: p.bg },
        p.border && { borderWidth: 1, borderColor: p.border },
      ]}
    >
      <Icon name={icon} size={iconSize} color={iconColor ?? p.fg} mirror={mirror} />
      {dot && <View style={[styles.dot, { top: size * 0.21, end: size * 0.24 }]} />}
      {!!count && <CountBadge count={count} style={styles.count} />}
    </Pressable>
  );
}

export function CountBadge({ count, style }: { count: number; style?: object }) {
  const f = useFormat();
  return (
    <View style={[styles.badge, style]}>
      <Text dense weight="extrabold" size={11} color={colors.onPrimary} style={styles.badgeText}>
        {f.count(count)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", width: 8, height: 8, borderRadius: 4, backgroundColor: colors.error, borderWidth: 1.5, borderColor: colors.bg },
  count: { position: "absolute", top: -6, end: -6 },
  badge: { minWidth: 19, height: 19, paddingHorizontal: 5, borderRadius: radius.pill, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  badgeText: { lineHeight: 14 },
});
