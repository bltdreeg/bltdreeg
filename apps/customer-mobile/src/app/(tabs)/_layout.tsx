// شريط التنقل السفلي من التصميم: الرئيسية / حجوزاتي / البحث / حسابي
import { Tabs } from "expo-router";
import { useTranslations } from "use-intl";
import { colors, font } from "@/styles/tokens";

export default function TabsLayout() {
  const t = useTranslations("common.bottomNav");
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontFamily: font.semibold },
      }}
    >
      <Tabs.Screen name="home" options={{ title: t("home") }} />
      <Tabs.Screen name="bookings" options={{ title: t("bookings") }} />
      <Tabs.Screen name="search" options={{ title: t("search") }} />
      <Tabs.Screen name="account" options={{ title: t("account") }} />
    </Tabs>
  );
}
