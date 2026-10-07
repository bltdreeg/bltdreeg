// نقط الصفحات: النقطة الحالية بتتمد لـ pill (22×6) — بتتبع السحب نفسه مش بس الصفحة النهائية
import { StyleSheet, View } from "react-native";
import Animated, { interpolate, interpolateColor, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { colors } from "@/styles/tokens";

function Dot({ index, position }: { index: number; position: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const distance = Math.min(1, Math.abs(position.get() - index));
    return {
      width: interpolate(distance, [0, 1], [22, 6]),
      backgroundColor: interpolateColor(distance, [0, 1], [colors.primary, colors.divider]),
    };
  });
  return <Animated.View style={[styles.dot, style]} />;
}

export function PageDots({ count, position }: { count: number; position: SharedValue<number> }) {
  return (
    <View style={styles.row} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {Array.from({ length: count }, (_, i) => (
        <Dot key={i} index={i} position={position} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "center", gap: 6 },
  dot: { height: 6, borderRadius: 3 },
});
