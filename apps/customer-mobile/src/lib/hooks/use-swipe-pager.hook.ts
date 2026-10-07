// صفحات بعرض الشاشة بالسحب (الأونبوردنج، عارض الصور): Pan + Reanimated بدل FlatList paging —
// Android RTL بيعكس offsets الـ ScrollView ومابيحترمش initialScrollIndex. الصف بيتقلب في RTL لوحده، فالإزاحة بتتعكس (السحب يمين = اللي بعده).
import { useState } from "react";
import { I18nManager } from "react-native";
import { Gesture } from "react-native-gesture-handler";
import { useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";
import { duration, easing } from "@/theme/motion";

/** السحب لازم يعدّي ربع الشاشة أو يبقى سريع عشان يقلب الصفحة */
const SWIPE_RATIO = 0.25;
const SWIPE_VELOCITY = 500;

export function useSwipePager(count: number, width: number, initial = 0) {
  const reduceMotion = useReducedMotion();
  const last = count - 1;
  const [page, setPage] = useState(initial);
  // position = رقم الصفحة (عشري وقت السحب)
  const position = useSharedValue(initial);
  const dir = I18nManager.isRTL ? 1 : -1;

  const goTo = (index: number) => {
    const target = Math.max(0, Math.min(last, index));
    setPage(target);
    position.set(reduceMotion ? target : withTiming(target, { duration: duration.slow, easing: easing.page }));
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-12, 12])
    .failOffsetY([-12, 12])
    .onUpdate((e) => {
      const raw = page + (e.translationX * dir) / width;
      // مقاومة عند الأطراف
      position.set(raw < 0 ? raw / 3 : raw > last ? last + (raw - last) / 3 : raw);
    })
    .onEnd((e) => {
      const forward = e.translationX * dir > 0;
      const passed = Math.abs(e.translationX) > width * SWIPE_RATIO || Math.abs(e.velocityX) > SWIPE_VELOCITY;
      goTo(passed ? page + (forward ? 1 : -1) : page);
    });

  /** على الصف اللي فيه الصفحات (عرضه width × count) */
  const track = useAnimatedStyle(() => ({ transform: [{ translateX: dir * position.get() * width }] }));

  return { page, goTo, pan, track, position };
}
