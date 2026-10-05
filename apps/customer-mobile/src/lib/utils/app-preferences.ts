// تفضيلات الجهاز (مش بيانات الحساب): هل المستخدم شاف الأونبوردنج — زي onboardingSeen في تطبيق Flutter
import * as SecureStore from "expo-secure-store";

const ONBOARDING_SEEN_KEY = "beltadreeg_onboarding_seen";

let onboardingSeen = false;
const listeners = new Set<() => void>();

export const appPreferences = {
  async load(): Promise<void> {
    onboardingSeen = (await SecureStore.getItemAsync(ONBOARDING_SEEN_KEY)) === "1";
    listeners.forEach((l) => l());
  },

  onboardingSeen(): boolean {
    return onboardingSeen;
  },

  markOnboardingSeen(): void {
    onboardingSeen = true;
    void SecureStore.setItemAsync(ONBOARDING_SEEN_KEY, "1");
    listeners.forEach((l) => l());
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
