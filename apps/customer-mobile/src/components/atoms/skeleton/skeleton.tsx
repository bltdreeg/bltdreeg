// مكان فاضي لحد ما البيانات توصل — ألوان البورد (web.html §03): صندوق skeleton، وسطر العنوان/السعر strong أغمق.
// الحركة زي Shimmer في Flutter: لمعة (skeletonSheen) بتعدّي من الشمال لليمين، عرضها الشاشة كلها (Alignment(3t-2)→(3t-1) = عرض الـ rect).
import { useEffect } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { DimensionValue, StyleProp, ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { colors, radius as r } from "@/styles/tokens";
import { duration } from "@/theme/motion";

interface Props {
  width?: DimensionValue;
  height: number;
  radius?: number;
  /** سطر العنوان أو السعر — أغمق زي البورد */
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = "100%", height, radius = r.sm, strong, style }: Props) {
  const reduceMotion = useReducedMotion();
  const screen = useWindowDimensions().width;
  const t = useSharedValue(0);
  useEffect(() => {
    if (!reduceMotion) t.set(withRepeat(withTiming(1, { duration: duration.shimmer, easing: Easing.linear }), -1, false));
  }, [t, reduceMotion]);
  // ponytail: كل صندوق بيلمع لوحده (Flutter: ShaderMask واحد على الشاشة كلها) — نفس الشكل تقريباً من غير MaskedView
  const sheen = useAnimatedStyle(() => ({ transform: [{ translateX: ((3 * t.get() - 1) / 2) * screen }] }));
  const fill = strong ? colors.skeletonStrong : colors.skeleton;

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width, height, borderRadius: radius, backgroundColor: fill, overflow: "hidden" }, styles.ltr, style]}
    >
      {!reduceMotion && (
        <Animated.View
          style={[styles.sheen, { width: screen, experimental_backgroundImage: `linear-gradient(to right, ${fill}, ${colors.skeletonSheen}, ${fill})` }, sheen]}
        />
      )}
    </View>
  );
}

/** مكان SalonListItem (Flutter: SalonListTileSkeleton) */
export function SalonRowSkeleton() {
  return (
    <View style={styles.row}>
      <Skeleton width={86} height={86} radius={r.md} />
      <View style={styles.rowLines}>
        <Skeleton width={150} height={14} strong />
        <Skeleton width={200} height={10} style={styles.line2} />
        <Skeleton width={130} height={24} strong style={styles.line3} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // اللمعة بتمشي شمال→يمين في الاتجاهين زي Flutter: من غير ltr الـ RTL بيقلب left لـ right
  ltr: { direction: "ltr" },
  sheen: { position: "absolute", top: 0, bottom: 0, left: 0 },
  row: { flexDirection: "row", gap: 12, paddingVertical: 12 },
  rowLines: { flex: 1, minWidth: 0, paddingTop: 4 },
  line2: { marginTop: 10 },
  line3: { marginTop: 12 },
});
