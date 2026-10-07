// الجذر: اللغة + الجلسة قبل أول render (Cairo متضمّن في البيلد — expo-font plugin)، وحماية المسارات بدل proxy.ts بتاع الويب
import "@/i18n/intl-polyfills";
import { PortalHost } from "@rn-primitives/portal";
import { router, Stack, usePathname } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Dimensions, Platform } from "react-native";
import { ToastHost } from "@/components/molecules/toast";
import { defaultLocale, loadLocale, type Locale } from "@/i18n/config";
import { Providers } from "@/lib/contexts/providers";
import { useSession } from "@/lib/hooks/use-session.hook";
import { appPreferences } from "@/lib/utils/app-preferences";
import { recentSearches } from "@/lib/utils/recent-searches";
import { tokenStorage } from "@/lib/utils/auth/token-storage";
import { requiresLogin } from "@/lib/utils/route-guards";

SplashScreen.preventAutoHideAsync();

// الموبايل portrait بس؛ التابلت (أقصر ضلع ≥ 600) بيلف براحته
const { width, height } = Dimensions.get("screen");
if (Platform.OS !== "web" && Math.min(width, height) < 600) {
  void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
}

export default function RootLayout() {
  const [locale, setLocale] = useState<Locale | null>(null);
  const { hasSession } = useSession();
  const onboardingSeen = useSyncExternalStore(appPreferences.subscribe, appPreferences.onboardingSeen);

  useEffect(() => {
    // لو التخزين فشل (مثلاً على الويب) نكمل بالافتراضي بدل ما الـ splash يفضل للأبد
    Promise.all([loadLocale(), tokenStorage.load(), appPreferences.load(), recentSearches.load()])
      .then(([l]) => setLocale(l))
      .catch(() => setLocale(defaultLocale));
  }, []);

  const ready = locale !== null;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Providers locale={locale}>
      <StatusBar style="dark" />
      <LoginRedirect hasSession={hasSession} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!onboardingSeen}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={onboardingSeen}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="salon/[salonId]/index" />
          <Stack.Screen name="salon/[salonId]/gallery/index" />
          <Stack.Screen
            name="salon/[salonId]/gallery/photo"
            options={{ presentation: "transparentModal", animation: "fade" }}
          />

          {/* زي Flutter: شاشات الدخول مش محمية — نجاح الدخول بيوديك لـ from أو الرئيسية من الشاشة نفسها */}
          <Stack.Screen name="(auth)" />

          {/* محتاجة تسجيل دخول — الحماية في LoginRedirect (بيرجّعك لنفس المكان بعد الدخول) */}
          <Stack.Screen name="salon/[salonId]/book/slot" />
          <Stack.Screen name="salon/[salonId]/book/barber" />
          <Stack.Screen name="salon/[salonId]/book/review" />
          <Stack.Screen name="booking/[bookingId]/confirmed" options={{ animation: "fade" }} />
          <Stack.Screen name="booking/[bookingId]/rate/index" />
          <Stack.Screen name="booking/[bookingId]/rate/sent" options={{ animation: "fade" }} />
          <Stack.Screen name="queue/[bookingId]" />

          <Stack.Protected guard={__DEV__}>
            <Stack.Screen name="dev/design-system" />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
      <ToastHost />
      {/* الحوارات (@rn-primitives) بتترسم هنا فوق كل الشاشات */}
      <PortalHost />
    </Providers>
  );
}

/** ضيف فتح مسار محتاج حساب (زي Flutter): يروح لتسجيل الدخول ومعاه المسار عشان يرجعله بعد الدخول */
function LoginRedirect({ hasSession }: { hasSession: boolean }) {
  const pathname = usePathname();
  useEffect(() => {
    if (!hasSession && requiresLogin(pathname)) router.replace({ pathname: "/login", params: { from: pathname } });
  }, [hasSession, pathname]);
  return null;
}
