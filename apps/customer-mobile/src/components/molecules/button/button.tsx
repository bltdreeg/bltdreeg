// الأزرار من التصميم (.btn): primary / secondary / ghost / danger / dangerOutline / success / onTint،
// بالارتفاعات 54 / 52 / 48 / 44 / 38. معطّل = مفيش onPress أو disabled.
import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { colors, radius, sizes } from "@/styles/tokens";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "dangerOutline" | "success" | "onTint";
export type ButtonSize = "xl" | "lg" | "md" | "sm" | "xs";

const SIZE: Record<ButtonSize, { height: number; fontSize: number; radius: number; padding: number }> = {
  xl: { height: 54, fontSize: 17, radius: radius.field, padding: 18 },
  lg: { height: sizes.buttonLg, fontSize: 16, radius: radius.field, padding: 18 },
  md: { height: sizes.buttonMd, fontSize: 15, radius: radius.field, padding: 18 },
  sm: { height: sizes.buttonSm, fontSize: 14, radius: radius.field, padding: 16 },
  xs: { height: sizes.buttonXs, fontSize: 13.5, radius: 9, padding: 14 },
};

function palette(variant: ButtonVariant, enabled: boolean): { bg: string; fg: string; border?: string } {
  const outlined = variant === "secondary" || variant === "dangerOutline" || variant === "onTint";
  if (!enabled) return outlined ? { bg: colors.bg, fg: colors.textDisabled, border: colors.border } : { bg: colors.disabled, fg: colors.onDisabled };
  switch (variant) {
    case "primary":
      return { bg: colors.primary, fg: colors.onPrimary };
    case "secondary":
      return { bg: colors.bg, fg: colors.textPrimary, border: colors.border };
    case "ghost":
      return { bg: colors.tealTint, fg: colors.tealDark };
    case "danger":
      return { bg: colors.error, fg: colors.onPrimary };
    case "dangerOutline":
      return { bg: colors.bg, fg: colors.error, border: colors.errBorder };
    case "success":
      return { bg: colors.success, fg: colors.onPrimary };
    case "onTint":
      return { bg: colors.bg, fg: colors.tealDark };
  }
}

interface Props {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  /** custom leading (e.g. the multicolor Google mark) */
  leading?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  /** fill the width (default) or hug content */
  expand?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "lg",
  icon,
  leading,
  loading,
  disabled,
  expand = true,
  accessibilityHint,
  style,
}: Props) {
  const enabled = !!onPress && !disabled;
  const s = SIZE[size];
  const c = palette(variant, enabled);

  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled || loading}
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy: !!loading }}
      style={[
        styles.root,
        { minHeight: s.height, borderRadius: s.radius, paddingHorizontal: s.padding, backgroundColor: c.bg },
        c.border && { borderWidth: 1, borderColor: c.border },
        expand ? styles.expand : styles.hug,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={c.fg} />
      ) : (
        <View style={styles.content}>
          {leading ?? (icon && <Icon name={icon} size={sizes.iconSm + 2} color={c.fg} />)}
          <Text variant="button" size={s.fontSize} color={c.fg} numberOfLines={1} style={styles.label}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { alignItems: "center", justifyContent: "center" },
  expand: { alignSelf: "stretch" },
  hug: { alignSelf: "flex-start" },
  content: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, maxWidth: "100%" },
  label: { flexShrink: 1 },
  underline: { textDecorationLine: "underline" },
});

/** رابط نصي teal ("نسيت كلمة السر؟"، "شوف الكل"، "غيّر") — hitSlop بيكمّل لـ 44 */
export function LinkButton({ label, onPress, color = colors.primary, size, underline }: { label: string; onPress?: () => void; color?: string; size?: number; underline?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={!onPress} accessibilityRole="link" accessibilityLabel={label} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
      <Text variant="link" size={size} numberOfLines={1} color={onPress ? color : colors.textDisabled} style={underline && styles.underline}>
        {label}
      </Text>
    </Pressable>
  );
}
