// عنصر الضغط الوحيد في التطبيق (زي AppPressable في Flutter): بيصغر لـ 0.97 وقت الضغط ويرجع بنعومة.
// أي حاجة بتتداس (زرار، chip، كارت، صف) بتتبني عليه — مش TouchableOpacity ولا ripple.
import type { ReactNode } from "react";
import { Pressable as RNPressable, type Insets, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { duration, pressedScale as defaultScale } from "@/theme/motion";

const MIN_TOUCH = 44;
// الـ style (flex، alignSelf…) لازم يبقى على العنصر نفسه اللي جوه الصف — فبنحرّك الـ Pressable نفسه مش View جواه
const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

interface Props extends Omit<PressableProps, "style" | "children" | "hitSlop"> {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** الشكل المرسوم أصغر من 44؟ ادّي مقاسه عشان الـ hitSlop يكمّل لـ 44 */
  visualSize?: { width?: number; height?: number };
  hitSlop?: Insets | number;
  pressedScale?: number;
}

function slopFor(visual?: { width?: number; height?: number }): Insets | undefined {
  if (!visual) return undefined;
  const v = Math.max(0, (MIN_TOUCH - (visual.height ?? MIN_TOUCH)) / 2);
  const h = Math.max(0, (MIN_TOUCH - (visual.width ?? MIN_TOUCH)) / 2);
  return v || h ? { top: v, bottom: v, left: h, right: h } : undefined;
}

export function Pressable({
  children,
  style,
  visualSize,
  hitSlop,
  pressedScale = defaultScale,
  disabled,
  accessibilityRole = "button",
  accessibilityState,
  onPressIn,
  onPressOut,
  ...props
}: Props) {
  const reduceMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      {...props}
      style={[style, animated]}
      disabled={disabled}
      hitSlop={hitSlop ?? slopFor(visualSize)}
      accessibilityRole={accessibilityRole}
      accessibilityState={{ disabled: !!disabled, ...accessibilityState }}
      onPressIn={(e) => {
        if (!reduceMotion) scale.set(withTiming(pressedScale, { duration: duration.press }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withTiming(1, { duration: duration.release }));
        onPressOut?.(e);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
