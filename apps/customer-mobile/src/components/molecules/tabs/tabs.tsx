// SegmentedTabs (.tabs — فريم 4 و 9): خلفية surf والمختار أبيض بظل. UnderlineTabs (صفحة الصالون): المختار teal بخط تحت.
// فوق @rn-primitives/tabs: الدور (tablist/tab) والحالة منه، الشكل مننا.
import * as TabsPrimitive from "@rn-primitives/tabs";
import { useEffect, useRef } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { colors, font, shadow } from "@/styles/tokens";

interface Props<K extends string> {
  tabs: { key: K; label: string }[];
  value: K;
  onChange: (key: K) => void;
}

export function SegmentedTabs<K extends string>({ tabs, value, onChange }: Props<K>) {
  return (
    <TabsPrimitive.Root asChild value={value} onValueChange={(key) => onChange(key as K)}>
      <TabsPrimitive.List style={styles.segmented}>
        {tabs.map((tab) => {
          const on = tab.key === value;
          return (
            <TabsPrimitive.Trigger key={tab.key} value={tab.key} asChild>
              <Pressable accessibilityLabel={tab.label} pressedScale={1} style={[styles.segment, on && styles.segmentOn]}>
                <Text dense variant="bodyStrong" size={14} color={on ? colors.textPrimary : colors.textSecondary} numberOfLines={1}>
                  {tab.label}
                </Text>
              </Pressable>
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

export function UnderlineTabs<K extends string>({ tabs, value, onChange }: Props<K>) {
  // المختار يفضل ظاهر لما الشريط أعرض من الشاشة (خط ١٤٠٪ أو شاشة ضيقة): نوسّطه
  const scroll = useRef<ScrollView>(null);
  const viewport = useRef(0);
  const spots = useRef<Partial<Record<K, { x: number; width: number }>>>({});
  useEffect(() => {
    const spot = spots.current[value];
    if (spot) scroll.current?.scrollTo({ x: Math.max(0, spot.x + spot.width / 2 - viewport.current / 2) });
  }, [value]);

  return (
    <TabsPrimitive.Root asChild value={value} onValueChange={(key) => onChange(key as K)}>
      <TabsPrimitive.List asChild>
        <ScrollView
          ref={scroll}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.underlineRow}
          onLayout={(e) => (viewport.current = e.nativeEvent.layout.width)}
        >
          {tabs.map((tab) => {
            const on = tab.key === value;
            return (
              <TabsPrimitive.Trigger key={tab.key} value={tab.key} asChild>
                <Pressable
                  accessibilityLabel={tab.label}
                  pressedScale={1}
                  style={[styles.underlineTab, on && styles.underlineOn]}
                  onLayout={(e) => (spots.current[tab.key] = { x: e.nativeEvent.layout.x, width: e.nativeEvent.layout.width })}
                >
                  <Text dense variant="body" size={14} color={on ? colors.teal : colors.textSecondary} style={on && styles.bold}>
                    {tab.label}
                  </Text>
                </Pressable>
              </TabsPrimitive.Trigger>
            );
          })}
        </ScrollView>
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  );
}

const styles = StyleSheet.create({
  segmented: { flexDirection: "row", backgroundColor: colors.surf, borderRadius: 12, padding: 4, gap: 4 },
  segment: { flex: 1, minHeight: 40, borderRadius: 9, alignItems: "center", justifyContent: "center", paddingHorizontal: 8 },
  segmentOn: { backgroundColor: colors.bg, ...shadow.segment },
  underlineRow: { paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.line, minWidth: "100%" },
  underlineTab: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 12, borderBottomWidth: 2.5, borderBottomColor: "transparent", minHeight: 44, justifyContent: "center" },
  underlineOn: { borderBottomColor: colors.teal },
  bold: { fontFamily: font.extrabold },
});
