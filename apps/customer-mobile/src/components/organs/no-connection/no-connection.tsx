// "النت فاصل" شاشة كاملة (فريم 18) — لما مفيش أي بيانات محفوظة نعرضها. لو فيه كاش: OfflineBar (فريم 08) بدلها.
import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTranslations } from "use-intl";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, radius } from "@/styles/tokens";

export function NoConnection({ onRetry, retrying }: { onRetry: () => void; retrying?: boolean }) {
  const t = useTranslations("mobile.offline");
  const { gutter, listMaxWidth } = useResponsive();
  return (
    <ScrollView contentContainerStyle={[styles.root, { paddingHorizontal: gutter }]}>
      <View style={[styles.inner, { maxWidth: listMaxWidth }]}>
        <EmptyState illustration="no_internet" title={t("title")} message={t("body")}>
          <Button label={t("retry")} icon="refresh" onPress={onRetry} loading={retrying} />
          <Button label={t("openLastBooking")} variant="secondary" size="md" onPress={() => router.navigate("/bookings")} />
        </EmptyState>
        <View style={styles.tips}>
          <Text variant="label" weight="bold" style={styles.tipsTitle}>
            {t("tipsTitle")}
          </Text>
          {[t("tipData"), t("tipAirplane")].map((tip) => (
            <View key={tip} style={styles.tip}>
              <View style={styles.bullet} />
              <Text variant="note" style={styles.flex}>
                {tip}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
  inner: { width: "100%", alignSelf: "center" },
  tips: { backgroundColor: colors.surf, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, paddingHorizontal: 16, paddingVertical: 14, marginTop: -8 }, // EmptyState بيسيب 36 تحت والبورد 28
  tipsTitle: { marginBottom: 10 },
  tip: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 8 },
  bullet: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.textSecondary },
  flex: { flex: 1 },
});
