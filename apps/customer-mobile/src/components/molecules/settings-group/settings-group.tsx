// قوايم الإعدادات (فريم 16، 37، 42): GroupLabel + ListGroup (كارت بحدود) + ListRow (أيقونة، عنوان، قيمة، سهم)
import { Children, Fragment, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { colors, radius, sizes } from "@/styles/tokens";

export function GroupLabel({ children }: { children: string }) {
  return (
    <Text variant="groupLabel" accessibilityRole="header" style={styles.groupLabel}>
      {children}
    </Text>
  );
}

/** كارت بحدود فيه صفوف بفواصل بينها */
export function ListGroup({ label, children }: { label?: string; children: ReactNode }) {
  const rows = Children.toArray(children).filter(Boolean);
  return (
    <View>
      {label && <GroupLabel>{label}</GroupLabel>}
      <View style={styles.group}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={styles.divider} />}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

interface RowProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  iconColor?: string;
  /** القيمة الرمادية على الطرف ("العربية"، "١ نشط") */
  value?: string;
  onPress?: () => void;
  /** بدل السهم (toggle، badge…) */
  trailing?: ReactNode;
  danger?: boolean;
  dimmed?: boolean;
}

export function ListRow({ title, subtitle, icon, iconColor, value, onPress, trailing, danger, dimmed }: RowProps) {
  const fg = danger ? colors.error : colors.textPrimary;
  const content = (
    <>
      {icon && <Icon name={icon} size={sizes.icon} color={iconColor ?? (danger ? colors.error : colors.textSecondary)} />}
      <View style={styles.text}>
        <Text variant="body" color={fg}>
          {title}
        </Text>
        {subtitle && <Text variant="caption">{subtitle}</Text>}
      </View>
      {value && (
        <Text variant="label" size={13} color={colors.textSecondary} numberOfLines={1} style={styles.value}>
          {value}
        </Text>
      )}
      {trailing ?? (onPress && <Icon name="chevron_right" size={sizes.iconSm} color={colors.textDisabled} mirror />)}
    </>
  );

  if (!onPress) {
    return (
      <View style={[styles.row, dimmed && styles.dimmed]} accessible accessibilityLabel={[title, subtitle, value].filter(Boolean).join("، ")}>
        {content}
      </View>
    );
  }
  return (
    <Pressable onPress={onPress} accessibilityLabel={[title, value].filter(Boolean).join("، ")} pressedScale={0.99} style={[styles.row, dimmed && styles.dimmed]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  groupLabel: { marginHorizontal: 4, marginBottom: 8 },
  group: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.card, paddingHorizontal: 14, paddingVertical: 2, marginBottom: 14 },
  divider: { height: 1, backgroundColor: colors.line },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 15, minHeight: 52 },
  text: { flex: 1, minWidth: 0 },
  value: { flexShrink: 1, maxWidth: "45%" },
  dimmed: { opacity: 0.5 },
});
