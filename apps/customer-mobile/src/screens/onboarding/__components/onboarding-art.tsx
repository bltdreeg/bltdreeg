// رسومات الأونبوردنج المتحركة (فريم 01–03) — منقولة من onboarding_illustrations.dart في Flutter:
// دخول مرة واحدة أول ما الشريحة تظهر، وloop وهي ظاهرة بس. "تقليل الحركة" = آخر frame ثابت.
// اللوحة 280×240 بوحدات الـ viewBox ومتكبّرة كلها مرة واحدة (زي FittedBox) — الطبقات SVG والنصوص فوقها.
import { useEffect, useState, type ComponentProps, type ComponentType, type ReactNode } from "react";
import { StyleSheet, Text, View, type TextStyle } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  FadeInDown,
  FadeOutUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { SvgProps } from "react-native-svg";
import { useTranslations } from "use-intl";
import Background from "@/assets/illustrations/onboarding_choose_barber/background.svg";
import Chair from "@/assets/illustrations/onboarding_choose_barber/chair.svg";
import BladeBottom from "@/assets/illustrations/onboarding_choose_barber/scissors_blade_bottom.svg";
import BladeTop from "@/assets/illustrations/onboarding_choose_barber/scissors_blade_top.svg";
import StarLeft from "@/assets/illustrations/onboarding_choose_barber/star_left.svg";
import StarRight from "@/assets/illustrations/onboarding_choose_barber/star_right.svg";
import Pin from "@/assets/illustrations/onboarding_find_salons/pin.svg";
import FindScene from "@/assets/illustrations/onboarding_find_salons/scene.svg";
import ClockHands from "@/assets/illustrations/onboarding_live_queue/clock_hands.svg";
import QueueScene from "@/assets/illustrations/onboarding_live_queue/scene.svg";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { colors, font } from "@/styles/tokens";
import { curve, onboardingArt } from "@/theme/motion";

const VB_W = 280;
const VB_H = 240;
/** RLM: سطر عربي يبدأ بعلامة (~) جوه لوحة LTR */
const RLM = "‏";

type Svg = ComponentType<SvgProps>;
type Timing = { entrance: number; loop: number };

/** entrance (0→1 مرة واحدة) و loop (0→1 بيتكرر وهي ظاهرة) — زي _AnimatedIllustrationState */
function useArtClock(active: boolean, { entrance, loop }: Timing) {
  const reduce = useReducedMotion();
  const e = useSharedValue(reduce ? 1 : 0);
  const l = useSharedValue(0);
  useEffect(() => {
    if (reduce) {
      e.set(1);
      cancelAnimation(l);
      return;
    }
    if (!active) return cancelAnimation(l);
    if (e.get() === 0) e.set(withTiming(1, { duration: entrance, easing: Easing.linear }));
    l.set(0);
    l.set(withRepeat(withTiming(1, { duration: loop, easing: Easing.linear }), -1));
  }, [active, reduce, e, l, entrance, loop]);
  return { e, l, reduce };
}

/** تقدّم الـ entrance جوه [a, b] بالمنحنى */
const phase = (v: number, a: number, b: number, c?: (t: number) => number) => {
  "worklet";
  // الـ default جوه الجسم: الـ worklet مابيلقطش المتغيرات من default params
  return (c ?? curve.outCubic)(Math.min(1, Math.max(0, (v - a) / (b - a))));
};

function Canvas({ width, children }: { width: number; children: ReactNode }) {
  const k = width / VB_W;
  return (
    <View style={[styles.frame, { width, height: VB_H * k }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.canvas, { transform: [{ scale: k }] }]}>{children}</View>
    </View>
  );
}

function Layer({ Svg, style, pivot }: { Svg: Svg; style: ComponentProps<typeof Animated.View>["style"]; pivot?: [number, number] }) {
  return (
    <Animated.View style={[styles.layer, pivot && { transformOrigin: [pivot[0], pivot[1], 0] }, style]}>
      <Svg width={VB_W} height={VB_H} />
    </Animated.View>
  );
}

/** نص فوق الرسمة، متوسّط على (cx, cy) — زي IllustrationLabel */
function Label({ cx, cy, maxWidth, children }: { cx: number; cy: number; maxWidth: number; children: ReactNode }) {
  return <View style={[styles.label, { left: cx - maxWidth / 2, top: cy - 40, width: maxWidth }]}>{children}</View>;
}

/** عدّاد: الجديد طالع من تحت والقديم خارج لفوق، مقصوص في مكانه */
function Swap({ text, style }: { text: string; style: TextStyle }) {
  const d = onboardingArt.liveQueue.swap;
  return (
    <View style={[styles.slot, { height: style.lineHeight }]}>
      <Animated.Text key={text} entering={FadeInDown.duration(d)} exiting={FadeOutUp.duration(d)} allowFontScaling={false} numberOfLines={1} style={style}>
        {RLM + text}
      </Animated.Text>
    </View>
  );
}

// ---- شريحة ١: الدبوس بينزل على الحي ----
function FindSalons({ active, width }: { active: boolean; width: number }) {
  const { e, l } = useArtClock(active, onboardingArt.findSalons);
  const scene = useAnimatedStyle(() => ({ opacity: phase(e.get(), 0, 0.35), transform: [{ scale: 0.94 + 0.06 * phase(e.get(), 0, 0.45) }] }));
  const pin = useAnimatedStyle(() => {
    const drop = phase(e.get(), 0.25, 0.8, curve.bounceOut);
    const float = e.get() === 1 ? Math.sin(l.get() * 2 * Math.PI) * 3 : 0;
    return { opacity: phase(e.get(), 0.25, 0.4), transform: [{ translateY: -56 * (1 - drop) + float }] };
  });
  return (
    <Canvas width={width}>
      <Layer Svg={FindScene} style={scene} pivot={[140, 170]} />
      <Layer Svg={Pin} style={pin} />
    </Canvas>
  );
}

// ---- شريحة ٢: الرقم بيقل والساعة شغّالة ----
const QUEUE_START = 6;
const QUEUE_END = 4;

function LiveQueue({ active, width }: { active: boolean; width: number }) {
  const t = useTranslations("mobile.onboarding.art");
  const f = useFormat();
  const { e, l, reduce } = useArtClock(active, onboardingArt.liveQueue);
  const [ticked, setTicked] = useState(QUEUE_START);
  const n = reduce ? QUEUE_END : ticked;
  useEffect(() => {
    if (reduce || !active || ticked <= QUEUE_END) return;
    const id = setTimeout(() => setTicked((v) => v - 1), onboardingArt.liveQueue.tick);
    return () => clearTimeout(id);
  }, [active, reduce, ticked]);

  const scene = useAnimatedStyle(() => {
    const fade = phase(e.get(), 0, 1);
    return { opacity: fade, transform: [{ scale: 0.95 + 0.05 * fade }] };
  });
  const hands = useAnimatedStyle(() => ({ opacity: phase(e.get(), 0, 1), transform: [{ rotate: `${reduce ? 0 : l.get() * 2 * Math.PI}rad` }] }));
  const ahead = n - 2;

  return (
    <Canvas width={width}>
      <Layer Svg={QueueScene} style={scene} pivot={[140, 120]} />
      <Layer Svg={ClockHands} style={hands} pivot={[234, 170]} />
      <Label cx={140} cy={73} maxWidth={64}>
        <Swap text={f.number(n)} style={styles.number} />
      </Label>
      <Label cx={140} cy={110} maxWidth={80}>
        <Text allowFontScaling={false} numberOfLines={1} style={styles.caption}>
          {t("queueNumber")}
        </Text>
      </Label>
      <Label cx={140} cy={134} maxWidth={80}>
        <Swap text={t("peopleLeft", { count: ahead, n: f.number(ahead) })} style={styles.ahead} />
      </Label>
      <Label cx={140} cy={160} maxWidth={80}>
        <Swap text={`~ ${f.minutes(ahead * 10)}`} style={styles.wait} />
      </Label>
    </Canvas>
  );
}

// ---- شريحة ٣: المشهد بيتركّب، النجوم بتلمع، المقص بيقص، والأسعار بتظهر ----
const SCISSORS_PIVOT: [number, number] = [202.9, 168];

function ChooseBarber({ active, width }: { active: boolean; width: number }) {
  const f = useFormat();
  const { e, l, reduce } = useArtClock(active, onboardingArt.chooseBarber);
  const sin = () => {
    "worklet";
    return e.get() === 1 && !reduce ? Math.sin(l.get() * 2 * Math.PI) : 0;
  };
  const snip = () => {
    "worklet";
    return e.get() === 1 && !reduce && l.get() < 0.5 ? 0.2 * Math.abs(Math.sin(l.get() * 4 * Math.PI)) : 0;
  };

  const bg = useAnimatedStyle(() => ({ opacity: phase(e.get(), 0, 0.2), transform: [{ scale: phase(e.get(), 0, 0.4, curve.backOut) * 0.15 + 0.85 }] }));
  const chair = useAnimatedStyle(() => {
    const p = phase(e.get(), 0.12, 0.5);
    return { opacity: p, transform: [{ translateY: 22 * (1 - p) }] };
  });
  const starL = useAnimatedStyle(() => ({ transform: [{ scale: phase(e.get(), 0.42, 0.72, curve.elasticOut) * (1 + 0.12 * sin()) }] }));
  const starR = useAnimatedStyle(() => ({ transform: [{ scale: phase(e.get(), 0.52, 0.82, curve.elasticOut) * (1 - 0.12 * sin()) }] }));
  const top = useAnimatedStyle(() => ({ opacity: phase(e.get(), 0.45, 0.7), transform: [{ rotate: `${-snip()}rad` }] }));
  const bottom = useAnimatedStyle(() => ({ opacity: phase(e.get(), 0.45, 0.7), transform: [{ rotate: `${snip()}rad` }] }));
  const pricePill = useAnimatedStyle(() => ({ transform: [{ scale: phase(e.get(), 0.68, 0.9, curve.backOut) }] }));
  const timePill = useAnimatedStyle(() => ({ transform: [{ scale: phase(e.get(), 0.78, 1, curve.backOut) }] }));

  return (
    <Canvas width={width}>
      <Layer Svg={Background} style={bg} pivot={[140, 118]} />
      <Layer Svg={Chair} style={chair} />
      <Layer Svg={StarLeft} style={starL} pivot={[78, 53]} />
      <Layer Svg={StarRight} style={starR} pivot={[202, 53]} />
      <Layer Svg={BladeTop} style={top} pivot={SCISSORS_PIVOT} />
      <Layer Svg={BladeBottom} style={bottom} pivot={SCISSORS_PIVOT} />
      <Label cx={56} cy={155} maxWidth={90}>
        <Animated.View style={[styles.pill, { borderColor: colors.success }, pricePill]}>
          <Text allowFontScaling={false} numberOfLines={1} style={[styles.pillText, { color: colors.okDark }]}>
            {f.price(85)}
          </Text>
        </Animated.View>
      </Label>
      <Label cx={56} cy={183} maxWidth={90}>
        <Animated.View style={[styles.pill, { borderColor: colors.textSecondary }, timePill]}>
          <Text allowFontScaling={false} numberOfLines={1} style={[styles.pillText, { color: colors.textSecondary }]}>
            {f.minutes(25)}
          </Text>
        </Animated.View>
      </Label>
    </Canvas>
  );
}

export const ONBOARDING_ART = [FindSalons, LiveQueue, ChooseBarber] as const;

const styles = StyleSheet.create({
  // الرسمة اتجاهها ثابت (مش بتتقلب في RTL) — left/top هنا فعلاً شمال/فوق
  frame: { direction: "ltr", overflow: "visible" },
  canvas: { position: "absolute", left: 0, top: 0, width: VB_W, height: VB_H, transformOrigin: [0, 0, 0] },
  layer: { position: "absolute", left: 0, top: 0, width: VB_W, height: VB_H },
  label: { position: "absolute", height: 80, alignItems: "center", justifyContent: "center" },
  slot: { overflow: "hidden", justifyContent: "center", alignItems: "center", alignSelf: "stretch" },
  number: { fontFamily: font.extrabold, fontSize: 26, lineHeight: 29, color: colors.onPrimary, textAlign: "center" },
  caption: { fontFamily: font.semibold, fontSize: 11.5, lineHeight: 14, color: colors.textSecondary, textAlign: "center" },
  ahead: { fontFamily: font.bold, fontSize: 10.5, lineHeight: 13, color: colors.okDark, textAlign: "center" },
  wait: { fontFamily: font.bold, fontSize: 10.5, lineHeight: 13, color: colors.textSecondary, textAlign: "center" },
  pill: { backgroundColor: colors.bg, borderRadius: 10, borderWidth: 2.2, paddingHorizontal: 6, paddingVertical: 1.5 },
  pillText: { fontFamily: font.extrabold, fontSize: 10.5, lineHeight: 12, textAlign: "center" },
});
