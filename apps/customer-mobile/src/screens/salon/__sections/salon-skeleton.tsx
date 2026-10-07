// تحميل صفحة الصالون أول مرة — نفس _DetailsSkeleton في Flutter
import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/components/atoms/skeleton";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, radius } from "@/styles/tokens";

export function SalonSkeleton({ heroHeight }: { heroHeight: number }) {
  const { gutter } = useResponsive();
  return (
    // خلفية بيضا: الصفحة بتترسم من غير SafeAreaView، والـ navigator لونه رمادي (#F2F2F2)
    <View style={styles.root} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Skeleton height={heroHeight} radius={0} />
      <View style={[styles.body, { paddingHorizontal: gutter }]}>
        <Skeleton width={200} height={20} strong />
        <Skeleton width={240} height={12} style={styles.sub} />
        <Skeleton height={60} radius={radius.md} style={styles.card} />
        <Skeleton height={44} style={styles.rows} />
        <Skeleton height={44} style={styles.row} />
        <Skeleton height={44} style={styles.row} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  // مسافات _DetailsSkeleton: 20 فوق، 10 · 16 · 24 · 12
  body: { paddingTop: 20 },
  sub: { marginTop: 10 },
  card: { marginTop: 16 },
  rows: { marginTop: 24 },
  row: { marginTop: 12 },
});
