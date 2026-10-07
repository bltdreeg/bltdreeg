// Chips (.chip): عادي / مختار (teal) / lead = فلتر مفعّل بـ × للشيل. ChipRail = صف بيعمل scroll أفقي بحواف الـ gutter.
import { Children, type ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, radius } from "@/styles/tokens";

export type ChipKind = "default" | "selected" | "lead";

interface Props {
  label: string;
  onPress?: () => void;
  kind?: ChipKind;
  icon?: IconName;
  /** lead / recent-search chips: × that removes it */
  onRemove?: () => void;
  /** 36 (default) · 34 (recent searches, rating tags) · 32 (review filters) */
  height?: 36 | 34 | 32;
  disabled?: boolean;
}

const KIND = {
  default: { bg: colors.bg, border: colors.border, fg: colors.textPrimary },
  selected: { bg: colors.teal, border: colors.teal, fg: colors.onPrimary },
  lead: { bg: colors.tealTint, border: colors.tealTint2, fg: colors.tealDark },
} as const;

export function Chip({ label, onPress, kind = "default", icon, onRemove, height = 36, disabled }: Props) {
  const t = useTranslations("mobile.a11y");
  const k = KIND[kind];
  const role = kind === "lead" ? "button" : "togglebutton";

  return (
    <View style={[styles.root, { height, backgroundColor: k.bg, borderColor: k.border }, disabled && styles.disabled]}>
      <Pressable
        onPress={onPress}
        disabled={disabled || !onPress}
        accessibilityRole={role}
        accessibilityLabel={label}
        accessibilityState={kind === "selected" ? { selected: true } : undefined}
        hitSlop={{ top: (44 - height) / 2, bottom: (44 - height) / 2 }}
        style={styles.body}
      >
        {icon && <Icon name={icon} size={15} color={k.fg} />}
        <Text dense variant="label" size={height === 32 ? 12.5 : 13.5} color={k.fg} numberOfLines={1}>
          {label}
        </Text>
      </Pressable>
      {onRemove && (
        <Pressable onPress={onRemove} accessibilityLabel={t("remove", { label })} visualSize={{ width: 16, height: 16 }} style={styles.remove}>
          <Icon name="close" size={14} color={k.fg} />
        </Pressable>
      )}
    </View>
  );
}

/** chip يوم بسطرين (خطوة الميعاد، فلتر "متاح في يوم") — زي AppDateChip في Flutter */
export function DateChip({ top, bottom, selected, disabled, onPress }: { top: string; bottom: string; selected: boolean; disabled?: boolean; onPress: () => void }) {
  const fg = disabled ? colors.textDisabled : selected ? colors.onPrimary : colors.textPrimary;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="togglebutton"
      accessibilityLabel={`${top} ${bottom}`}
      accessibilityState={{ selected, disabled }}
      style={[styles.date, selected && styles.dateOn]}
    >
      <Text dense variant="caption" weight="semibold" color={selected ? colors.onPrimary : colors.textSecondary}>
        {top}
      </Text>
      <Text dense variant="label" size={13} weight="extrabold" color={fg}>
        {bottom}
      </Text>
    </Pressable>
  );
}

/** صف chips بيعمل scroll أفقي؛ الحواف = gutter الشاشة عشان أول chip تبدأ مع المحتوى */
export function ChipRail({ children, gap = 8 }: { children: ReactNode; gap?: number }) {
  const { gutter } = useResponsive();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap, paddingHorizontal: gutter, paddingVertical: 2 }}
    >
      {Children.toArray(children)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 14, gap: 6 },
  body: { flexDirection: "row", alignItems: "center", gap: 6, height: "100%" },
  remove: { padding: 2 },
  disabled: { opacity: 0.5 },
  date: { height: 56, minWidth: 64, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  dateOn: { backgroundColor: colors.teal, borderColor: colors.teal },
});
