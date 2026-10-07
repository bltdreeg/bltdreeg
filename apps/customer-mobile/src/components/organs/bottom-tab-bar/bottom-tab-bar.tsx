// شريط التنقل السفلي (.nav): الرئيسية / حجوزاتي / البحث / حسابي — أيقونة bold + teal للمختار.
// الترتيب بيتقلب مع اتجاه الواجهة لوحده (flex row). المسافة تحت = max(18 من التصميم, inset الجهاز).
import type { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, shadow } from "@/styles/tokens";

export type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const ICONS: Record<string, [IconName, IconName]> = {
  home: ["home", "home_bold"],
  bookings: ["calendar", "calendar_bold"],
  search: ["search", "search_bold"],
  account: ["user", "user_bold"],
};

export function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { listMaxWidth } = useResponsive();

  return (
    <View style={[styles.root, { paddingBottom: Math.max(18, insets.bottom) }]} accessibilityRole="tablist">
      <View style={[styles.items, { maxWidth: listMaxWidth }]}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = String(options.title ?? route.name);
          const [icon, iconActive] = ICONS[route.name] ?? ["home", "home_bold"];
          const color = focused ? colors.teal : colors.textSecondary;

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={() => navigation.emit({ type: "tabLongPress", target: route.key })}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: focused }}
              style={styles.item}
            >
              <Icon name={focused ? iconActive : icon} size={22} color={color} />
              <Text dense variant="navLabel" weight={focused ? "bold" : "semibold"} color={color} numberOfLines={1}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.navBackground,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 10,
    alignItems: "center",
    ...shadow.float,
  },
  items: { flexDirection: "row", width: "100%" },
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, minHeight: 50 },
});
