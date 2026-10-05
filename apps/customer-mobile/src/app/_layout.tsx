// الجذر: خطوط Cairo + اللغة + الجلسة قبل أول render، وحماية المسارات بدل proxy.ts بتاع الويب
import {
  Cairo_400Regular,
  Cairo_500Medium,
  Cairo_600SemiBold,
  Cairo_700Bold,
  Cairo_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/cairo";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useSyncExternalStore } from "react";
import { defaultLocale, loadLocale, type Locale } from "@/i18n/config";
import { Providers } from "@/lib/contexts/providers";
import { useSession } from "@/lib/hooks/use-session.hook";
import { appPreferences } from "@/lib/utils/app-preferences";
import { tokenStorage } from "@/lib/utils/auth/token-storage";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Cairo_400Regular,
    Cairo_500Medium,
    Cairo_600SemiBold,
    Cairo_700Bold,
    Cairo_800ExtraBold,
  });
  const [locale, setLocale] = useState<Locale | null>(null);
  const { hasSession } = useSession();
  const onboardingSeen = useSyncExternalStore(appPreferences.subscribe, appPreferences.onboardingSeen);

  useEffect(() => {
    // لو SecureStore فشل (مثلاً على الويب) نكمل بالافتراضي بدل ما الـ splash يفضل للأبد
    Promise.all([loadLocale(), tokenStorage.load(), appPreferences.load()])
      .then(([l]) => setLocale(l))
      .catch(() => setLocale(defaultLocale));
  }, []);

  const ready = fontsLoaded && locale !== null;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  // ponytail: a guest opening a protected route lands on home (Stack.Protected fallback), not login?from=… like Flutter; add the return-to with the real login screen.
  return (
    <Providers locale={locale}>
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

          <Stack.Protected guard={!hasSession}>
            <Stack.Screen name="(auth)" />
          </Stack.Protected>

          <Stack.Protected guard={hasSession}>
            <Stack.Screen name="salon/[salonId]/book/slot" />
            <Stack.Screen name="salon/[salonId]/book/barber" />
            <Stack.Screen name="salon/[salonId]/book/review" />
            <Stack.Screen name="booking/[bookingId]/confirmed" options={{ animation: "fade" }} />
            <Stack.Screen name="booking/[bookingId]/rate/index" />
            <Stack.Screen name="booking/[bookingId]/rate/sent" options={{ animation: "fade" }} />
            <Stack.Screen name="queue/[bookingId]" />
          </Stack.Protected>

          <Stack.Protected guard={__DEV__}>
            <Stack.Screen name="dev/design-system" />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
    </Providers>
  );
}
