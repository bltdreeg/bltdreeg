// بادجات الحالة: WaitBadge (.wait) و StatusPin (.pin فوق صورة الكارت) متسيّرين بـ WaitStatus،
// Badge لحالات الحجز (.badge)، و LiveIndicator ("لايف" بنقطة بتنبض).
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { useTranslations } from "use-intl";
import { Icon, type IconName } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import type { WaitStatus } from "@/lib/types/queue";
import { colors, radius, shadow, tone, type Tone } from "@/styles/tokens";
import { duration } from "@/theme/motion";

export const WAIT_TONE: Record<WaitStatus, Tone> = {
  free: "success",
  short: "success",
  mid: "warning",
  busy: "danger",
  closed: "neutral",
  stale: "neutral",
};

/** "فاضل ٢ أنفار — استنى ~١٥ د" · stale = "الانتظار مش متحدّث" بأيقونة wifi_off */
export function WaitBadge({ status, label, icon }: { status: WaitStatus; label: string; icon?: IconName }) {
  const t = tone[WAIT_TONE[status]];
  const fg = status === "closed" || status === "stale" ? colors.textSecondary : t.foreground;
  return (
    <View style={[styles.wait, { backgroundColor: t.background }]}>
      <Icon name={icon ?? (status === "stale" ? "wifi_off" : "clock")} size={14} color={fg} />
      <Text dense variant="metaStrong" color={fg} numberOfLines={1} style={styles.shrink}>
        {label}
      </Text>
    </View>
  );
}

/** على صورة الكارت الأفقي: أبيض ٩٤٪ + نقطة بلون الحالة */
export function StatusPin({ status, label }: { status: WaitStatus; label: string }) {
  const t = tone[WAIT_TONE[status]];
  return (
    <View style={styles.pin}>
      <StatusDot color={t.solid} size={7} />
      <Text dense variant="tag" color={t.foreground}>
        {label}
      </Text>
    </View>
  );
}

export type BadgeStyle = "live" | "soon" | "done" | "missed" | "success";

const BADGE: Record<BadgeStyle, { bg: string; fg: string; border?: string }> = {
  live: { bg: colors.primary, fg: colors.onPrimary },
  soon: { bg: colors.warnTint, fg: colors.warnText },
  done: { bg: colors.surf, fg: colors.textSecondary, border: colors.border },
  missed: { bg: colors.errTint, fg: colors.errText },
  success: { bg: colors.okTint, fg: colors.okDark },
};

export function Badge({ label, kind = "done", icon }: { label: string; kind?: BadgeStyle; icon?: IconName }) {
  const b = BADGE[kind];
  return (
    <View style={[styles.badge, { backgroundColor: b.bg }, b.border && { borderWidth: 1, borderColor: b.border }]}>
      {icon && <Icon name={icon} size={13} color={b.fg} />}
      <Text dense variant="badge" color={b.fg}>
        {label}
      </Text>
    </View>
  );
}

export function StatusDot({ color = colors.success, size = 8 }: { color?: string; size?: number }) {
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />;
}

/** "لايف" — النقطة بتنبض طول ما التحديث شغّال */
export function LiveIndicator({ active = true }: { active?: boolean }) {
  const t = useTranslations("mobile.common");
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.set(active && !reduceMotion ? withRepeat(withTiming(1, { duration: duration.livePulse }), -1) : 0);
  }, [active, pulse, reduceMotion]);
  const ring = useAnimatedStyle(() => ({ opacity: (1 - pulse.get()) * 0.5, transform: [{ scale: 1 + pulse.get() * 1.6 }] }));
  const tn = tone[active ? "success" : "neutral"];

  return (
    <View style={[styles.live, { backgroundColor: tn.background }]}>
      <View style={styles.liveDot}>
        {active && <Animated.View style={[StyleSheet.absoluteFill, styles.round, { backgroundColor: tn.solid }, ring]} />}
        <StatusDot color={tn.solid} size={7} />
      </View>
      <Text dense variant="tag" weight="extrabold" color={tn.foreground}>
        {t("live")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wait: { flexDirection: "row", alignItems: "center", gap: 6, minHeight: 27, paddingHorizontal: 10, borderRadius: radius.sm, alignSelf: "flex-start", maxWidth: "100%" },
  shrink: { flexShrink: 1 },
  pin: { flexDirection: "row", alignItems: "center", gap: 4, height: 26, paddingHorizontal: 9, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.94)", ...shadow.pin },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, minHeight: 26, paddingHorizontal: 10, borderRadius: 7, alignSelf: "flex-start" },
  live: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  liveDot: { width: 7, height: 7 },
  round: { borderRadius: 4 },
});
