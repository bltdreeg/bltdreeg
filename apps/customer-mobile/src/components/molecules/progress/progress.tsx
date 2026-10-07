// StepProgress: 3 شرايح × 4 في مسار الحجز ("الخطوة 2 من 3"). QueueProgress: 4 شرايح × 6 بعناوين في متابعة الدور (فريم 27–29).
import { StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { colors, radius } from "@/styles/tokens";

export function StepProgress({ step, total = 3 }: { step: number; total?: number }) {
  const t = useTranslations("mobile.common");
  const f = useFormat();
  return (
    <View style={styles.step} accessible accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: step }}>
      <View style={styles.segments}>
        {Array.from({ length: total }, (_, i) => (
          <View key={i} style={[styles.segment, styles.thin, { backgroundColor: i < step ? colors.teal : colors.line }]} />
        ))}
      </View>
      <Text dense variant="caption">
        {t("stepOf", { step: f.number(step), total: f.number(total) })}
      </Text>
    </View>
  );
}

export type QueueStage = "waiting" | "almost" | "your_turn";

const SEGMENTS: Record<QueueStage, string[]> = {
  waiting: [colors.teal, colors.line, colors.line, colors.line],
  almost: [colors.teal, colors.teal, colors.warn, colors.line],
  your_turn: [colors.ok, colors.ok, colors.ok, colors.ok],
};

export function QueueProgress({ stage }: { stage: QueueStage }) {
  const t = useTranslations("mobile.queue.progress");
  const labels = [
    { key: "waiting", label: t("joined") },
    { key: "almost", label: t("almost") },
    { key: "your_turn", label: t("yourTurn") },
  ] as const;
  return (
    <View style={styles.queue} accessible accessibilityLabel={labels.find((l) => l.key === stage)!.label}>
      <View style={styles.segments}>
        {SEGMENTS[stage].map((c, i) => (
          <View key={i} style={[styles.segment, styles.thick, { backgroundColor: c }]} />
        ))}
      </View>
      <View style={styles.labels}>
        {labels.map((l) => {
          const active = l.key === stage;
          const color = active ? (stage === "almost" ? colors.warnText : stage === "your_turn" ? colors.okDark : colors.tealDark) : colors.textSecondary;
          return (
            // المفتاح بيتغير مع الوزن: Android مابيعيدش قياس النص لما الخط يتغير في مكانه فبيقصه
            <Text key={`${l.key}-${active}`} dense variant="tag" weight={active ? "extrabold" : "semibold"} color={color}>
              {l.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  step: { gap: 6 },
  queue: { gap: 8 },
  segments: { flexDirection: "row", gap: 4 },
  segment: { flex: 1, borderRadius: radius.pill },
  thin: { height: 4 },
  thick: { height: 6 },
  labels: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
});
