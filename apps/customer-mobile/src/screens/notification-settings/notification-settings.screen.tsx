// إعدادات الإشعارات (فريم 37) — زي NotificationSettingsPage في Flutter: محفوظة على الجهاز.
// تحديثات الطابور مقفولة على "شغّالة" ومش بتتطفي: لو اتقفلت العميل هيخسر دوره ويلوم التطبيق (قرار منتج مش إغفال).
import { useSyncExternalStore } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Toggle } from "@/components/atoms/selection-controls";
import { Text } from "@/components/atoms/text";
import { Notice } from "@/components/molecules/notice";
import { ListGroup, ListRow } from "@/components/molecules/settings-group";
import { TopBar } from "@/components/molecules/top-bar";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { appPreferences, type NotificationSetting } from "@/lib/utils/app-preferences";
import { colors } from "@/styles/tokens";

export default function NotificationSettingsScreen() {
  const t = useTranslations("mobile.notificationSettings");
  const tScreens = useTranslations("mobile.screens");
  const { gutter, formMaxWidth } = useResponsive();
  const settings = useSyncExternalStore(appPreferences.subscribe, appPreferences.notificationSettings);
  const row = (key: NotificationSetting, title: string, subtitle?: string) => (
    <ListRow
      key={key}
      title={title}
      subtitle={subtitle}
      trailing={<Toggle value={settings[key]} onValueChange={(on) => appPreferences.setNotification(key, on)} accessibilityLabel={title} />}
    />
  );
  const column = { paddingHorizontal: gutter, maxWidth: formMaxWidth };

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={[styles.column, column]}>
        <TopBar title={tScreens("notificationSettings")} />
      </View>
      <ScrollView contentContainerStyle={[styles.column, styles.content, column]}>
        <ListGroup label={t("groupQueue")}>
          <ListRow
            title={t("queueUpdates")}
            subtitle={t("queueUpdatesBody")}
            trailing={
              <View style={styles.locked}>
                <Toggle value locked accessibilityLabel={t("queueUpdates")} />
                <Text dense variant="micro" color={colors.textSecondary}>
                  {t("alwaysOn")}
                </Text>
              </View>
            }
          />
        </ListGroup>
        <View style={styles.note}>
          <Notice tone="primary">{t("queueLockedNote")}</Notice>
        </View>
        <ListGroup label={t("groupOffers")}>
          {row("favoriteOffers", t("favoriteOffers"), t("favoriteOffersBody"))}
          {row("favoriteFree", t("favoriteFree"), t("favoriteFreeBody"))}
          {row("rateReminder", t("rateReminder"))}
          {row("newSalons", t("newSalons"))}
        </ListGroup>
        <ListGroup label={t("groupChannels")}>
          {row("push", t("push"), t("pushBody"))}
          {row("sms", t("sms"), t("smsBody"))}
        </ListGroup>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  column: { width: "100%", alignSelf: "center" },
  content: { paddingTop: 20, paddingBottom: 24 },
  locked: { alignItems: "flex-end", gap: 4 },
  note: { marginTop: -4, marginBottom: 18 },
});
