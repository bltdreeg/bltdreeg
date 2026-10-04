// تخزين توكن الجلسة في المتصفح. الواجهة بتكلم Laravel مباشرة، فالتوكن لازم يبقى مقروء من JS.
// كوكي (مش localStorage) عشان proxy.ts يقدر يقراها على السيرفر ويحمي المسارات من غير وميض.
import { ONBOARDING_COOKIE, SESSION_COOKIE } from "@/lib/data/constants/app.constants";
import { expireCookie, readCookie, serializeCookie } from "./cookie";

const NINETY_DAYS_SECONDS = 60 * 60 * 24 * 90;

const inBrowser = () => typeof document !== "undefined";
const isSecure = () => window.location.protocol === "https:";

export const tokenStorage = {
  getAccessToken(): string | null {
    return inBrowser() ? readCookie(document.cookie, SESSION_COOKIE) : null;
  },

  /** remember=false بيعمل session cookie بتتمسح لما المتصفح يتقفل */
  setSession(token: string, onboardingComplete: boolean, remember = true): void {
    const maxAge = remember ? NINETY_DAYS_SECONDS : undefined;
    document.cookie = serializeCookie(SESSION_COOKIE, token, { maxAge, secure: isSecure() });
    this.setOnboarding(onboardingComplete, remember);
  },

  /** علامة مش سر: الحساب لسه ناقص خطوات onboarding، proxy.ts بيحوّل عليها من غير API call */
  setOnboarding(complete: boolean, remember = true): void {
    if (!inBrowser()) return;
    document.cookie = complete
      ? expireCookie(ONBOARDING_COOKIE)
      : serializeCookie(ONBOARDING_COOKIE, "1", {
          maxAge: remember ? NINETY_DAYS_SECONDS : undefined,
          secure: isSecure(),
        });
  },

  clear(): void {
    if (!inBrowser()) return;
    document.cookie = expireCookie(SESSION_COOKIE);
    document.cookie = expireCookie(ONBOARDING_COOKIE);
  },
};
