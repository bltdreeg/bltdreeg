// تحميل الرئيسية أول مرة — نفس شكل _HomeSkeleton في Flutter (هيدر، بحث، chips، شريط كروت SalonRailCardSkeleton، صفين)
import { ScrollView, StyleSheet, View } from "react-native";
import { SalonRowSkeleton, Skeleton } from "@/components/atoms/skeleton";
import { RAIL_CARD_WIDTH } from "@/components/organs/salon-card";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { radius } from "@/styles/tokens";

export function HomeSkeleton() {
  const { gutter } = useResponsive();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.block, { paddingHorizontal: gutter }]}>
        <Skeleton width={110} height={10} />
        <Skeleton width={170} height={16} />
        <View style={styles.gap} />
        <Skeleton height={50} radius={radius.field} />
        <View style={styles.chips}>
          <Skeleton width={120} height={36} radius={radius.pill} />
          <Skeleton width={90} height={36} radius={radius.pill} />
        </View>
      </View>
      <ScrollView horizontal scrollEnabled={false} showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.rail, { paddingHorizontal: gutter }]}>
        {[0, 1].map((i) => (
          <View key={i} style={styles.card}>
            <Skeleton height={104} radius={radius.card} />
            <Skeleton width={140} height={13} style={styles.cardLine} />
            <Skeleton width={100} height={10} />
          </View>
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: gutter }}>
        <SalonRowSkeleton />
        <SalonRowSkeleton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: { gap: 8, paddingTop: 6 },
  gap: { height: 6 },
  chips: { flexDirection: "row", gap: 8, marginTop: 6, marginBottom: 22 },
  rail: { gap: 12 },
  card: { width: RAIL_CARD_WIDTH, gap: 8 },
  cardLine: { marginTop: 2 },
});
