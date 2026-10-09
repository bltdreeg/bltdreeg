// تخزين توكن الجلسة على الموبايل في SecureStore (Keychain / Keystore).
// نفس واجهة نسخة الويب عشان auth.action يفضل زي ما هو. بنحتفظ بنسخة في الذاكرة
// عشان getAccessToken يفضل sync للـ axios interceptor، و load() بتتنادى مرة واحدة وقت الإقلاع.
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "beltadreeg_session";
const ONBOARDING_KEY = "beltadreeg_onboarding";

let token: string | null = null;
let needsOnboarding = false;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const tokenStorage = {
  async load(): Promise<void> {
    [token, needsOnboarding] = await Promise.all([
      SecureStore.getItemAsync(TOKEN_KEY),
      SecureStore.getItemAsync(ONBOARDING_KEY).then((v) => v === "1"),
    ]);
    emit();
  },

  getAccessToken(): string | null {
    return token;
  },

  needsOnboarding(): boolean {
    return needsOnboarding;
  },

  /** remember=false: الجلسة في الذاكرة بس وبتتمسح لما التطبيق يتقفل */
  setSession(value: string, onboardingComplete: boolean, remember = true): void {
    token = value;
    if (remember) void SecureStore.setItemAsync(TOKEN_KEY, value);
    this.setOnboarding(onboardingComplete, remember);
  },

  setOnboarding(complete: boolean, remember = true): void {
    needsOnboarding = !complete;
    if (complete) void SecureStore.deleteItemAsync(ONBOARDING_KEY);
    else if (remember) void SecureStore.setItemAsync(ONBOARDING_KEY, "1");
    emit();
  },

  clear(): void {
    token = null;
    needsOnboarding = false;
    void SecureStore.deleteItemAsync(TOKEN_KEY);
    void SecureStore.deleteItemAsync(ONBOARDING_KEY);
    emit();
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
