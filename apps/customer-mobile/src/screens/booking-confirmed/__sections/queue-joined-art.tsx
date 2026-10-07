// "دخلت الطابور" (فريم 26) — زي QueueJoinedIllustration في Flutter: الهالة بتكبر، الدايرة الخضرا بتنط،
// الـ ✓ بترسم نفسها (+ اهتزاز لما تخلص)، وبعدها موجة ونقط ملونة. "تقليل الحركة" = الرسمة الثابتة.
import * as Haptics from "expo-haptics";
import { useEffect } from "react";
import Animated, { Easing, useAnimatedProps, useReducedMotion, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";
import Svg, { Circle, Path } from "react-native-svg";
import { Illustration } from "@/components/atoms/illustration";
import { colors } from "@/styles/tokens";
import { curve, queueJoinedArt } from "@/theme/motion";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

/** طول M61 81 l13 13 25-27 */
const CHECK_LENGTH = Math.hypot(13, 13) + Math.hypot(25, 27);
const CONFETTI = [colors.ok, colors.teal, colors.warn, colors.ok, colors.teal, colors.warn, colors.ok, colors.teal];

const phase = (v: number, a: number, b: number, c?: (t: number) => number) => {
  "worklet";
  return (c ?? curve.outCubic)(Math.min(1, Math.max(0, (v - a) / (b - a))));
};
const lerp = (a: number, b: number, t: number) => {
  "worklet";
  return a + (b - a) * t;
};

function Dot({ i, p }: { i: number; p: SharedValue<number> }) {
  const angle = -Math.PI / 2 + (i * Math.PI) / 4 + Math.PI / 8;
  const props = useAnimatedProps(() => {
    const burst = phase(p.get(), 0.58, 1);
    const d = lerp(50, 74, burst);
    const visible = burst > 0 && burst < 1;
    return {
      cx: 80 + Math.cos(angle) * d,
      cy: 80 + Math.sin(angle) * d,
      r: visible ? (i % 2 === 0 ? 3.2 : 2.4) * (1 - burst * 0.5) : 0,
      opacity: burst < 0.7 ? 1 : Math.max(0, (1 - burst) / 0.3),
    };
  });
  return <AnimatedCircle animatedProps={props} fill={CONFETTI[i]} />;
}

export function QueueJoinedArt({ width }: { width: number }) {
  const reduce = useReducedMotion();
  const p = useSharedValue(0);

  useEffect(() => {
    if (reduce) return;
    p.set(withTiming(1, { duration: queueJoinedArt.duration, easing: Easing.linear }));
    const id = setTimeout(() => void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium), queueJoinedArt.duration * queueJoinedArt.checkDoneAt);
    return () => clearTimeout(id);
  }, [p, reduce]);

  const halo = useAnimatedProps(() => ({ r: 62 * Math.max(0, phase(p.get(), 0, 0.35, curve.backOut)) }));
  const ripple = useAnimatedProps(() => {
    const t = phase(p.get(), 0.6, 1, curve.outQuad);
    return { r: lerp(46, 78, t), strokeWidth: lerp(5, 1, t), strokeOpacity: t > 0 && t < 1 ? 0.35 * (1 - t) : 0 };
  });
  const disc = useAnimatedProps(() => ({ r: 44 * Math.max(0, phase(p.get(), 0.15, 0.5, curve.elasticOut)) }));
  const check = useAnimatedProps(() => ({ strokeDashoffset: CHECK_LENGTH * (1 - phase(p.get(), 0.38, queueJoinedArt.checkDoneAt)) }));

  if (reduce) return <Illustration name="queue_joined" width={width} />;
  return (
    <Svg width={width} height={width} viewBox="0 0 160 160" accessible={false}>
      <AnimatedCircle cx={80} cy={80} animatedProps={halo} fill={colors.okTint} />
      <AnimatedCircle cx={80} cy={80} animatedProps={ripple} fill="none" stroke={colors.ok} />
      <AnimatedCircle cx={80} cy={80} animatedProps={disc} fill={colors.ok} />
      <AnimatedPath
        d="M61 81l13 13 25-27"
        fill="none"
        stroke={colors.onPrimary}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={CHECK_LENGTH}
        animatedProps={check}
      />
      {CONFETTI.map((_, i) => (
        <Dot key={i} i={i} p={p} />
      ))}
    </Svg>
  );
}
