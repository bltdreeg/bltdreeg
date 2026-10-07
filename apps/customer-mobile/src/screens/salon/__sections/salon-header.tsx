// رأس صفحة الصالون: الصورة بعرض الشاشة تحت شريط الحالة (فريم 21) + شريط علوي ثابت بيظهر لما تسكرول (فريم 22–23):
// رجوع ومشاركة وقلب دايماً، والاسم + "المعادي · فاضي دلوقتي" بيظهروا مع خلفية الشريط.
import { router } from "expo-router";
import { Share, StyleSheet, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { IconButton } from "@/components/molecules/icon-button";
import { FavoriteButton } from "@/components/organs/favorite-button";
import { useSalonLabels } from "@/components/organs/salon-card";
import { useFormat } from "@/lib/hooks/use-format.hook";
import type { SalonPage } from "@/lib/types/salon";
import { colors, radius } from "@/styles/tokens";

/** ارتفاع الشريط العلوي تحت شريط الحالة (Flutter: collapsedBar 60) */
export const TOP_BAR = 60;
const HERO_BELOW_STATUS = 172;

export const heroHeight = (insetTop: number) => insetTop + HERO_BELOW_STATUS;

const goBack = () => (router.canGoBack() ? router.back() : router.replace("/home"));
const openGallery = (id: string) => router.push({ pathname: "/salon/[salonId]/gallery", params: { salonId: id } });

export function SalonHero({ page }: { page: SalonPage }) {
  const t = useTranslations("mobile.salon");
  const f = useFormat();
  const insets = useSafeAreaInsets();
  const photos = page.gallery.filter((g) => g.kind !== "video").length;
  const hasVideo = page.gallery.some((g) => g.kind === "video");
  return (
    <Pressable onPress={() => openGallery(page.summary.id)} pressedScale={1} accessibilityLabel={t("photosCount", { count: photos, n: f.count(photos) })} style={[styles.hero, { height: heroHeight(insets.top) }]}>
      <Icon name="camera" size={42} color={colors.placeholderIcon} />
      <View style={styles.heroChips}>
        <View style={styles.heroChip}>
          <Icon name="camera" size={15} color={colors.textSecondary} />
          <Text dense variant="badge" color={colors.textSecondary}>
            {t("photosCount", { count: photos, n: f.count(photos) })}
          </Text>
        </View>
        {hasVideo && (
          <View style={styles.heroChip}>
            <Icon name="play" size={15} color={colors.textSecondary} />
            <Text dense variant="badge" color={colors.textSecondary}>
              {t("video")}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.dotOn]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </Pressable>
  );
}

export function SalonTopBar({ page, scrollY, collapseAt }: { page: SalonPage; scrollY: SharedValue<number>; collapseAt: number }) {
  const tA11y = useTranslations("mobile.a11y");
  const tCommon = useTranslations("mobile.common");
  const tSalon = useTranslations("mobile.salon");
  const labels = useSalonLabels();
  const insets = useSafeAreaInsets();
  const s = page.summary;
  const fade = useAnimatedStyle(() => ({ opacity: interpolate(scrollY.get(), [collapseAt - 40, collapseAt], [0, 1], Extrapolation.CLAMP) }));
  const status = s.opensAt ? tSalon("closedNow") : labels.pin(s).label;

  const share = () => void Share.share({ message: tSalon("shareText", { salon: s.name, link: `https://beltadreeg.app/salon/${s.id}` }) });

  return (
    <View style={[styles.bar, { paddingTop: insets.top, height: insets.top + TOP_BAR }]} pointerEvents="box-none">
      <Animated.View style={[StyleSheet.absoluteFill, styles.barBg, fade]} pointerEvents="none" />
      <IconButton icon="chevron_left" mirror onPress={goBack} accessibilityLabel={tA11y("back")} />
      <Animated.View style={[styles.barTitle, fade]} pointerEvents="none">
        <Text variant="topBarTitle" numberOfLines={1}>
          {s.name}
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {tCommon("dot", { a: s.areaName, b: status })}
        </Text>
      </Animated.View>
      <IconButton icon="share" onPress={share} accessibilityLabel={tA11y("share")} />
      <FavoriteButton salonId={s.id} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.surf, borderBottomWidth: 1, borderBottomColor: colors.line, alignItems: "center", justifyContent: "center" },
  heroChips: { position: "absolute", bottom: 12, start: 16, flexDirection: "row", gap: 8 },
  heroChip: { flexDirection: "row", alignItems: "center", gap: 5, height: 28, paddingHorizontal: 10, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.bg },
  dots: { position: "absolute", bottom: 24, end: 16, flexDirection: "row", gap: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.line },
  dotOn: { width: 16, backgroundColor: colors.textSecondary },
  bar: { position: "absolute", top: 0, start: 0, end: 0, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16 },
  barBg: { backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.line },
  barTitle: { flex: 1, minWidth: 0 },
});
