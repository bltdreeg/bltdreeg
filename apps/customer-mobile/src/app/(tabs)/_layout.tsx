// شريط التنقل السفلي من التصميم: الرئيسية / حجوزاتي / البحث / حسابي
import { Tabs } from "expo-router";
import { useTranslations } from "use-intl";
import { BottomTabBar } from "@/components/organs/bottom-tab-bar";

export default function TabsLayout() {
  const t = useTranslations("common.bottomNav");
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <BottomTabBar {...props} />}>
      <Tabs.Screen name="home" options={{ title: t("home") }} />
      <Tabs.Screen name="bookings" options={{ title: t("bookings") }} />
      <Tabs.Screen name="search" options={{ title: t("search") }} />
      <Tabs.Screen name="account" options={{ title: t("account") }} />
    </Tabs>
  );
}
