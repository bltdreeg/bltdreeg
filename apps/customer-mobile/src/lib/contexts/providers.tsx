import { focusManager, onlineManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppState, Platform, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { IntlProvider } from "use-intl";
import { intlLocale, messages, type Locale } from "@/i18n/config";
import { connectivity } from "@/lib/utils/connectivity";

// React Query على RN: الرجوع للتطبيق = refetch (حالة الطابور الحية)، والنت من connectivity (NetInfo + القطع التجريبي)
if (Platform.OS !== "web") {
  focusManager.setEventListener((setFocused) => {
    const sub = AppState.addEventListener("change", (state) => setFocused(state === "active"));
    return () => sub.remove();
  });
}
onlineManager.setEventListener((setOnline) => {
  const stopNet = connectivity.listen();
  const unsubscribe = connectivity.subscribe(() => setOnline(connectivity.isOnline()));
  return () => {
    stopNet();
    unsubscribe();
  };
});

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <GestureHandlerRootView style={styles.root}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <IntlProvider locale={intlLocale(locale)} messages={messages[locale]} timeZone="Africa/Cairo">
            {children}
          </IntlProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
