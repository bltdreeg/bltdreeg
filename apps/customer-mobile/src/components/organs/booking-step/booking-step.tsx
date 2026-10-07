// هيكل خطوات الحجز (فريم 24–25) زي BookingStepScaffold في Flutter: شريط + "الخطوة N من ٣" + المحتوى + زرار ثابت تحت.
// الحالات: مفيش خدمات مختارة → "الحجز لسه مش كامل"، تحميل، من غير نت، خطأ.
import { router } from "expo-router";
import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Skeleton } from "@/components/atoms/skeleton";
import { Button } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { StepProgress } from "@/components/molecules/progress";
import { TopBar } from "@/components/molecules/top-bar";
import { NoConnection } from "@/components/organs/no-connection";
import { useOnline } from "@/lib/hooks/use-online.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { useSalonPage } from "@/lib/hooks/salons";
import type { SalonPage } from "@/lib/types/salon";
import { useBookingDraft, type DraftService } from "@/lib/utils/booking-draft";
import { colors, radius, shadow } from "@/styles/tokens";

interface Props {
  salonId: string;
  title: string;
  step: number;
  children: (page: SalonPage, draft: DraftService[]) => ReactNode;
  footer: (page: SalonPage, draft: DraftService[]) => ReactNode;
}

export function BookingStep({ salonId, title, step, children, footer }: Props) {
  const t = useTranslations("mobile.booking");
  const tHome = useTranslations("mobile.home");
  const tOffline = useTranslations("mobile.offline");
  const insets = useSafeAreaInsets();
  const { gutter, formMaxWidth } = useResponsive();
  const online = useOnline();
  const draft = useBookingDraft(salonId);
  const q = useSalonPage(salonId);
  const page = q.data;
  const width = { paddingHorizontal: gutter, maxWidth: formMaxWidth };

  let body: ReactNode;
  if (!draft.length) {
    body = (
      <EmptyState illustration="empty_bookings" illustrationWidth={170} title={t("incompleteTitle")} message={t("incompleteBody")}>
        <Button label={t("backToSalon")} onPress={() => router.dismissTo({ pathname: "/salon/[salonId]", params: { salonId } })} />
      </EmptyState>
    );
  } else if (page) {
    body = (
      <ScrollView contentContainerStyle={[styles.content, width]}>
        <StepProgress step={step} />
        <View style={styles.body}>{children(page, draft)}</View>
      </ScrollView>
    );
  } else if (!q.isError && online) {
    body = (
      <View style={[styles.content, styles.skeleton, width]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <Skeleton height={20} width={120} />
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} height={72} radius={radius.card} />
        ))}
      </View>
    );
  } else if (!online) {
    body = <NoConnection onRetry={() => void q.refetch()} retrying={q.isFetching} />;
  } else {
    body = (
      <EmptyState illustration="no_internet" title={tHome("loadErrorTitle")}>
        <Button label={tOffline("retry")} icon="refresh" onPress={() => void q.refetch()} />
      </EmptyState>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={{ paddingHorizontal: gutter }}>
        <TopBar title={title} />
      </View>
      <View style={styles.flex}>{body}</View>
      {page && draft.length > 0 && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <View style={[styles.footerInner, width]}>{footer(page, draft)}</View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  content: { width: "100%", alignSelf: "center", paddingTop: 10, paddingBottom: 18 },
  body: { marginTop: 18 },
  skeleton: { gap: 12 },
  footer: { borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.bg, paddingTop: 12, ...shadow.float },
  footerInner: { width: "100%", alignSelf: "center", gap: 10 },
});
