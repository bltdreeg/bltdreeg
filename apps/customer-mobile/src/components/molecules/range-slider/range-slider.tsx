// شريط سعر بمقبضين (فريم 14) زي RangeSlider في Flutter: خطوات ٥، مقبض أبيض بحلقة teal، الأقل ناحية البداية (يمين في العربي).
// مش على @rn-primitives: الـ slider بتاعهم قيمة واحدة بس (GAPS). كل مقبض adjustable لقارئ الشاشة.
import { useState } from "react";
import { I18nManager, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { colors } from "@/styles/tokens";

interface Props {
  min: number;
  max: number;
  step: number;
  low: number;
  high: number;
  onChange: (low: number, high: number) => void;
  /** نص القيمة لقارئ الشاشة ("٧٠ ج.م") */
  format: (v: number) => string;
  accessibilityLabel: string;
}

const THUMB = 22;

export function RangeSlider({ min, max, step, low, high, onChange, format, accessibilityLabel }: Props) {
  const [width, setWidth] = useState(0);
  // قيمة المقبض لما السحب بدأ — الـ gesture بيتعمل من جديد كل render فمينفعش تبقى متغير محلي
  const dragStart = useSharedValue(0);
  const span = Math.max(1, width - THUMB);
  const toPx = (v: number) => ((v - min) / (max - min)) * span;
  const snap = (v: number) => Math.min(max, Math.max(min, Math.round(v / step) * step));
  // في RTL السحب شمال بيزوّد القيمة
  const dir = I18nManager.isRTL ? -1 : 1;

  const thumb = (which: "low" | "high") => {
    const value = which === "low" ? low : high;
    const set = (v: number) => {
      const next = which === "low" ? Math.min(snap(v), high - step) : Math.max(snap(v), low + step);
      if (next === value) return;
      if (which === "low") onChange(next, high);
      else onChange(low, next);
    };
    const pan = Gesture.Pan()
      .runOnJS(true)
      .hitSlop(12)
      .onBegin(() => {
        dragStart.set(value);
      })
      .onUpdate((e) => set(dragStart.get() + (dir * e.translationX * (max - min)) / span));
    return (
      <GestureDetector key={which} gesture={pan}>
        <View
          accessible
          accessibilityRole="adjustable"
          accessibilityLabel={accessibilityLabel}
          accessibilityValue={{ min, max, now: value, text: format(value) }}
          accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
          onAccessibilityAction={(e) => set(value + (e.nativeEvent.actionName === "increment" ? step : -step))}
          style={[styles.thumb, { start: toPx(value) }]}
        />
      </GestureDetector>
    );
  };

  return (
    <View style={styles.root} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      <View style={styles.track} />
      <View style={[styles.track, styles.active, { start: toPx(low) + THUMB / 2, width: toPx(high) - toPx(low) }]} />
      {width > 0 && [thumb("low"), thumb("high")]}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { height: 36, justifyContent: "center" },
  track: { position: "absolute", start: THUMB / 2, end: THUMB / 2, height: 4, borderRadius: 2, backgroundColor: colors.line },
  active: { end: undefined, backgroundColor: colors.primary },
  thumb: { position: "absolute", width: THUMB, height: THUMB, borderRadius: THUMB / 2, backgroundColor: colors.bg, borderWidth: 2.5, borderColor: colors.primary },
});
