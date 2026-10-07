// الأونبوردنج (فريم 01–03) — نفس رحلة Flutter (onboarding_page.dart):
// "تخطّي" بينط لآخر شريحة عشان الاختيارين يفضلوا ظاهرين، "ادخل على الصالونات" = ضيف → الرئيسية، "عندي حساب" → تسجيل الدخول.
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  FadeIn,
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useTranslations } from "use-intl";
import { Icon } from "@/components/atoms/icon";
import { Pressable } from "@/components/atoms/pressable";
import { Text } from "@/components/atoms/text";
import { Button } from "@/components/molecules/button";
import { useFormat } from "@/lib/hooks/use-format.hook";
import { useSwipePager } from "@/lib/hooks/use-swipe-pager.hook";
import { useResponsive } from "@/lib/hooks/use-responsive.hook";
import { appPreferences } from "@/lib/utils/app-preferences";
import { colors, radius } from "@/styles/tokens";
import { duration } from "@/theme/motion";
import { ONBOARDING_ART } from "./__components/onboarding-art";
import { PageDots } from "./__components/page-dots";

const SLIDES = [{ key: "s1" }, { key: "s2" }, { key: "s3" }] as const;
const LAST = SLIDES.length - 1;

export default function OnboardingScreen() {
  const t = useTranslations("mobile.onboarding");
  const f = useFormat();
  const { width, height, gutter, isShort, formMaxWidth } = useResponsive();
  const insets = useSafeAreaInsets();
  const { page, goTo, pan, track, position } = useSwipePager(SLIDES.length, width);

  // "تخطّي" بيختفي مع الوصول لآخر شريحة (بيتبع السحب)
  const skipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      position.get(),
      [LAST - 1, LAST],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  const finish = (next: "home" | "login") => {
    appPreferences.markOnboardingSeen();
    // ponytail: Flutter pushes login over onboarding; onboarding is guarded off once seen here, so back from login goes Home (as a guest).
    router.replace(next === "home" ? "/home" : "/login");
  };

  // الرسمة: 78% من العرض بحد أقصى 290، وفي الشاشات القصيرة متتعداش ~30% من الطول
  const artWidth = Math.min(
    width * 0.78,
    290,
    isShort ? (height * 0.3 * 280) / 240 : Infinity,
  );

  return (
    <SafeAreaView style={styles.root} edges={["top"]}>
      <View style={[styles.header, { paddingHorizontal: gutter }]}>
        <View
          style={styles.brand}
          accessible
          accessibilityRole="header"
          accessibilityLabel={t("brand")}
        >
          <View style={styles.brandTile}>
            <Icon name="scissors" size={15} color={colors.onPrimary} />
          </View>
          <Text variant="topBarTitle" size={15}>
            {t("brand")}
          </Text>
        </View>
        <Animated.View style={skipStyle}>
          <Pressable
            onPress={() => goTo(LAST)}
            disabled={page === LAST}
            accessibilityLabel={t("skip")}
            hitSlop={12}
          >
            <Text variant="label" size={14} color={colors.textSecondary}>
              {t("skip")}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      <GestureDetector gesture={pan}>
        <View
          style={styles.viewport}
          accessibilityLabel={t("page", {
            page: f.number(page + 1),
            total: f.number(SLIDES.length),
          })}
        >
          <Animated.View
            style={[styles.track, { width: width * SLIDES.length }, track]}
          >
            {SLIDES.map((s, i) => {
              const Art = ONBOARDING_ART[i];
              return (
                <View
                  key={s.key}
                  style={[styles.slide, { width }]}
                  importantForAccessibility={
                    i === page ? "auto" : "no-hide-descendants"
                  }
                  accessibilityElementsHidden={i !== page}
                >
                  <View style={styles.art}>
                    <Art active={i === page} width={artWidth} />
                  </View>
                  <View
                    style={[
                      styles.copy,
                      { paddingHorizontal: gutter, maxWidth: formMaxWidth },
                    ]}
                  >
                    <Text variant="headline" accessibilityRole="header">
                      {t(`${s.key}Title`)}
                    </Text>
                    <Text variant="bodyLong">{t(`${s.key}Body`)}</Text>
                  </View>
                </View>
              );
            })}
          </Animated.View>
        </View>
      </GestureDetector>

      <View
        style={[
          styles.footer,
          {
            paddingHorizontal: gutter,
            paddingBottom: Math.max(26, insets.bottom + 8),
            maxWidth: formMaxWidth,
          },
        ]}
      >
        <PageDots count={SLIDES.length} position={position} />
        <View style={styles.ctas}>
          {page === LAST ? (
            <Animated.View
              key="last"
              entering={FadeIn.duration(duration.medium)}
              style={styles.lastCtas}
            >
              <Button label={t("s3Cta")} onPress={() => finish("home")} />
              <Button
                label={t("s3Login")}
                variant="secondary"
                size="md"
                onPress={() => finish("login")}
              />
            </Animated.View>
          ) : (
            <Button
              key="next"
              label={t(page === 0 ? "s1Cta" : "s2Cta")}
              onPress={() => goTo(page + 1)}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 46,
    paddingTop: 6,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandTile: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    backgroundColor: colors.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  viewport: { flex: 1, overflow: "hidden" },
  track: { flex: 1, flexDirection: "row" },
  slide: { flex: 1 },
  art: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  copy: { gap: 12, paddingBottom: 6, width: "100%", alignSelf: "center" },
  footer: { paddingTop: 18, gap: 18, width: "100%", alignSelf: "center" },
  ctas: { minHeight: 52 },
  lastCtas: { gap: 14 },
});
