// "بنعرضلك اللي قريب من / المعادي، القاهرة ⌄" (بيفتح شيت المنطقة) + الجرس بنقطة غير المقروء
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { IconButton } from "@/components/molecules/icon-button";
import { useUnreadCount } from "@/lib/hooks/notifications";
import { colors } from "@/styles/tokens";

export function HomeHeader({ areaLabel, onPressArea }: { areaLabel: string; onPressArea: () => void }) {
  const t = useTranslations("mobile.home");
  const tA11y = useTranslations("mobile.a11y");
  const unread = useUnreadCount();
  return (
    <View style={styles.root}>
      <Pressable onPress={onPressArea} accessibilityLabel={`${t("nearCaption")} ${areaLabel}`} pressedScale={0.98} style={styles.area}>
        <Text variant="caption" numberOfLines={1}>
          {t("nearCaption")}
        </Text>
        <View style={styles.areaRow}>
          <Icon name="map_pin" size={16} color={colors.teal} />
          <Text variant="topBarTitle" numberOfLines={1} style={styles.shrink}>
            {areaLabel}
          </Text>
          <Icon name="chevron_down" size={16} color={colors.textSecondary} />
        </View>
      </Pressable>
      <IconButton icon="bell" size={42} dot={unread > 0} onPress={() => router.push("/home/notifications")} accessibilityLabel={tA11y("notifications")} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, paddingTop: 6, paddingBottom: 14 },
  area: { flexShrink: 1, gap: 2 },
  areaRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  shrink: { flexShrink: 1 },
});
