// تحميل صفحة الصالون أول مرة — نفس _DetailsSkeleton في Flutter
import { StyleSheet, View } from "react-native";
import { Skeleton } from "@/components/atoms/skeleton";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { radius } from "@/styles/tokens";

export function SalonSkeleton({ heroHeight }: { heroHeight: number }) {
  const { gutter } = useResponsive();
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Skeleton height={heroHeight} radius={0} />
      <View style={[styles.body, { paddingHorizontal: gutter }]}>
        <Skeleton width={200} height={20} />
        <Skeleton width={240} height={12} />
        <Skeleton height={60} radius={radius.md} />
        <Skeleton height={44} />
        <Skeleton height={44} />
        <Skeleton height={44} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ body: { gap: 12, paddingTop: 16 } });
