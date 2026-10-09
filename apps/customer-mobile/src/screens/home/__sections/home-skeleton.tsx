// تحميل الرئيسية أول مرة — نفس _HomeSkeleton في Flutter بالمقاسات (هيدر، بحث، chips، كارتين rail، صفين)
import { StyleSheet, View } from "react-native";
import { SalonRowSkeleton, Skeleton } from "@/components/atoms/skeleton";
import { RAIL_CARD_WIDTH } from "@/components/organs/salon-card";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { radius } from "@/styles/tokens";

/** Flutter: SalonRailCardSkeleton */
function RailCardSkeleton() {
  return (
    <>
      <Skeleton height={104} radius={radius.card} />
      <Skeleton width={140} height={13} strong style={styles.cardTitle} />
      <Skeleton width={100} height={10} style={styles.cardLine} />
    </>
  );
}

export function HomeSkeleton() {
  const { gutter } = useResponsive();
  return (
    <View style={[styles.root, { paddingHorizontal: gutter }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Skeleton width={110} height={10} />
      <Skeleton width={170} height={16} strong style={styles.title} />
      <Skeleton height={50} radius={radius.field} style={styles.search} />
      <View style={styles.chips}>
        <Skeleton width={120} height={36} radius={radius.pill} />
        <Skeleton width={90} height={36} radius={radius.pill} />
      </View>
      {/* الكارت التاني بياخد الباقي (Expanded) زي Flutter */}
      <View style={styles.rail}>
        <View style={styles.firstCard}>
          <RailCardSkeleton />
        </View>
        <View style={styles.flex}>
          <RailCardSkeleton />
        </View>
      </View>
      <View style={styles.rows}>
        <SalonRowSkeleton />
        <SalonRowSkeleton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingTop: 12 },
  title: { marginTop: 8 },
  search: { marginTop: 18 },
  chips: { flexDirection: "row", gap: 8, marginTop: 14 },
  rail: { flexDirection: "row", gap: 12, marginTop: 26 },
  firstCard: { width: RAIL_CARD_WIDTH },
  flex: { flex: 1, minWidth: 0 },
  cardTitle: { marginTop: 10 },
  cardLine: { marginTop: 8 },
  rows: { marginTop: 24 },
});
