// القلب (صفحة الصالون، والمفضلة بعدين): الضيف بيروح يسجّل دخول ويرجع، المسجّل بيبدّل بنطّة صغيرة + اهتزاز خفيف
import * as Haptics from "expo-haptics";
import { router, usePathname } from "expo-router";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { useFavoriteIds, useToggleFavorite } from "@/lib/hooks/favorites";
import { useSession } from "@/lib/hooks/use-session.hook";
import { colors, radius } from "@/styles/tokens";
import { duration } from "@/theme/motion";

export function FavoriteButton({ salonId, size = 38 }: { salonId: string; size?: number }) {
  const t = useTranslations("mobile.a11y");
  const { hasSession } = useSession();
  const pathname = usePathname();
  const favorite = (useFavoriteIds().data ?? []).includes(salonId);
  const toggle = useToggleFavorite();
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  const onPress = () => {
    if (!hasSession) {
      router.push({ pathname: "/login", params: { from: pathname } });
      return;
    }
    if (!favorite && !reduceMotion) scale.set(withSequence(withTiming(1.35, { duration: duration.fast }), withSpring(1)));
    void Haptics.selectionAsync();
    toggle.mutate({ salonId, favorite: !favorite });
  };

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={favorite ? t("removeFavorite") : t("addFavorite")}
      accessibilityState={{ selected: favorite }}
      style={[styles.box, { width: size, height: size }]}
    >
      <Animated.View style={pop}>
        <Icon name={favorite ? "heart_filled" : "heart"} size={20} color={favorite ? colors.error : colors.textPrimary} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // البورد: أزرار الصورة ٣٨ بزوايا ١١
  box: { borderRadius: radius.field + 1, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
});
