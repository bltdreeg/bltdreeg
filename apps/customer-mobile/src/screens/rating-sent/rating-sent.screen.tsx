// شكراً — تقييمك اتبعت (فريم 41): بيقول التقييم راح فين وإمتى هيظهر، وبيقترح المفضلة في نفس اللحظة.
// بتبدل شاشة التقييم (replace)، فالرجوع مش بيفتح الفورم تاني.
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { EmptyState } from "@/components/molecules/empty-state";
import { Stars } from "@/components/molecules/rating";
import { salonName, SalonThumb } from "@/components/organs/salon-card";
import { useBooking } from "@/lib/hooks/booking";
import { useFavoriteIds, useToggleFavorite } from "@/lib/hooks/favorites";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { colors, radius } from "@/styles/tokens";

const goHome = () => router.replace("/");

export default function RatingSentScreen() {
  const t = useTranslations("mobile.rate.sent");
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { gutter, formMaxWidth } = useResponsive();
  const b = useBooking(bookingId).data;
  const favoriteIds = useFavoriteIds().data ?? [];
  const favorite = !!b && favoriteIds.includes(b.salonId);
  const toggle = useToggleFavorite();

  return (
    <SafeAreaView style={styles.root} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={[styles.content, { paddingHorizontal: gutter, maxWidth: formMaxWidth }]}>
        <EmptyState illustration="rating_sent" illustrationWidth={142} title={t("title")} message={t("body")} />
        {b && (
          <>
            <View style={styles.card}>
              <SalonThumb size={48} salonId={b.salonId} />
              <View style={styles.flex}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {salonName(b.salonName)}
                </Text>
                {b.rating != null && (
                  <View style={styles.stars}>
                    <Stars value={b.rating} size={14} />
                    <Text dense variant="caption" weight="semibold">
                      {t("yourRating")}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.favorite}>
              <View style={styles.favoriteHead}>
                <Icon name={favorite ? "heart_filled" : "heart"} size={22} color={colors.tealDark} />
                <View style={styles.flex}>
                  <Text variant="bodyStrong" weight="extrabold" color={colors.tealDark}>
                    {favorite ? t("favoriteAdded") : t("favoriteTitle")}
                  </Text>
                  <Text variant="meta" weight="semibold" color={colors.tealDark}>
                    {t("favoriteBody")}
                  </Text>
                </View>
              </View>
              {!favorite && <Button label={t("favoriteCta")} variant="onTint" size="sm" onPress={() => toggle.mutate({ salonId: b.salonId, favorite: true })} />}
            </View>
          </>
        )}
        <Button label={t("home")} variant="secondary" size="lg" onPress={goHome} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, justifyContent: "center", width: "100%", alignSelf: "center", gap: 12, paddingVertical: 24 },
  flex: { flex: 1, minWidth: 0 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius.card, padding: 16 },
  stars: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  favorite: { backgroundColor: colors.tealTint, borderRadius: radius.card, padding: 16, gap: 12 },
  favoriteHead: { flexDirection: "row", alignItems: "center", gap: 11 },
});
