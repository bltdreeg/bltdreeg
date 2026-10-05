// اللغة: العربي افتراضي دايماً (زي الويب)، والإنجليزي بس لو المستخدم اختاره من شاشة اللغة
import * as SecureStore from "expo-secure-store";
import { I18nManager } from "react-native";
import ar from "./messages/ar.json";
import en from "./messages/en.json";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";
export const messages = { ar, en } as const;

const LOCALE_KEY = "beltadreeg_locale";
let current: Locale = defaultLocale;

export const getLocale = (): Locale => current;

/** بتتنادى مرة واحدة وقت الإقلاع، قبل أول render */
export async function loadLocale(): Promise<Locale> {
  const saved = await SecureStore.getItemAsync(LOCALE_KEY);
  current = (locales as readonly string[]).includes(saved ?? "") ? (saved as Locale) : defaultLocale;
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(current === "ar");
  return current;
}

// ponytail: switching language needs an app reload for the RTL flip; add expo-updates reloadAsync with the language screen.
export async function setLocale(locale: Locale): Promise<void> {
  current = locale;
  await SecureStore.setItemAsync(LOCALE_KEY, locale);
}
