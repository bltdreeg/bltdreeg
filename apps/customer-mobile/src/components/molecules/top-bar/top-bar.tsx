// شريط الشاشات الفرعية: زرار رجوع 38 + عنوان (16/800) + سطر فرعي اختياري + حاجة على الطرف التاني.
// SectionHeader: عنوان قسم (16/700) + رابط "شوف الكل".
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { router } from "expo-router";
import { useTranslations } from "use-intl";
import { LinkButton } from "@/components/molecules/button";
import { IconButton } from "@/components/molecules/icon-button";
import { Text } from "@/components/atoms/text";
import { colors } from "@/styles/tokens";

interface Props {
  title?: string;
  subtitle?: string;
  /** default: back, or home when the screen was opened by a deep link (no history); null hides the button */
  onBack?: (() => void) | null;
  /** × instead of back (modal-like screens: rating, gallery) */
  close?: boolean;
  trailing?: ReactNode;
}

export function TopBar({ title, subtitle, onBack, close, trailing }: Props) {
  const t = useTranslations("mobile.a11y");
  const back = onBack === undefined ? () => (router.canGoBack() ? router.back() : router.replace("/")) : onBack;
  return (
    <View style={styles.root}>
      {back && (
        <IconButton
          icon={close ? "close" : "chevron_left"}
          mirror={!close}
          onPress={back}
          accessibilityLabel={close ? t("close") : t("back")}
        />
      )}
      <View style={styles.title}>
        {title && (
          <Text variant="topBarTitle" accessibilityRole="header" numberOfLines={1}>
            {title}
          </Text>
        )}
        {subtitle && (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>
      {trailing}
    </View>
  );
}

/** style: البورد بيصفّر الـ margin العلوي بعد SectionDivider */
export function SectionHeader({ title, action, onAction, style }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.section, style]}>
      <Text variant="sectionTitle" accessibilityRole="header" style={styles.flex} numberOfLines={1}>
        {title}
      </Text>
      {action && <LinkButton label={action} onPress={onAction} size={13} />}
    </View>
  );
}

/** فاصل الأقسام (.divider): شريط surf بعرض الشاشة */
export function SectionDivider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "center", gap: 12, minHeight: 52, paddingVertical: 7 },
  title: { flex: 1, minWidth: 0 },
  section: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22, marginBottom: 12 },
  flex: { flex: 1 },
  divider: { height: 8, backgroundColor: colors.surf, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, marginVertical: 18 },
});
