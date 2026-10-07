// اللغة: العربي افتراضي دايماً (زي الويب)، والإنجليزي بس لو المستخدم اختاره من شاشة اللغة
import { reloadAppAsync } from "expo";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { I18nManager, Platform } from "react-native";
import ar from "./messages/ar.json";
import en from "./messages/en.json";
import { readPref, removePref, writePref } from "@/lib/utils/device-prefs";

export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "ar";
export const messages = { ar, en } as const;

/** الـ locale اللي بيتبعت لـ Intl: العربي بأرقام عربية-هندية زي البورد (الأرقام المتنسقة نفسها من fmt() في number-format.utils) */
export const intlLocale = (locale: Locale) => (locale === "ar" ? "ar-EG-u-nu-arab" : "en");

const LOCALE_KEY = "beltadreeg_locale";
const RELOADED_FOR_KEY = "beltadreeg_dir_reloaded_for";
let current: Locale = defaultLocale;

export const getLocale = (): Locale => current;

// Expo Go بيرجّع الاتجاه لوحده، والويب مالوش I18nManager حقيقي — مفيش reload هناك
const canReload = Platform.OS !== "web" && Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

/** بيطلب الاتجاه الصح من النيتف؛ بيرجّع true لو لسه مش مطبّق (محتاج reload) */
function applyDirection(locale: Locale): boolean {
  const rtl = locale === "ar";
  I18nManager.allowRTL(rtl);
  I18nManager.forceRTL(rtl);
  return I18nManager.isRTL !== rtl;
}

/** بتتنادى مرة واحدة وقت الإقلاع، قبل أول render. أول تشغيل بالعربي بيعمل reload واحد عشان الواجهة تتقلب RTL. */
export async function loadLocale(): Promise<Locale> {
  const saved = await readPref(LOCALE_KEY);
  current = (locales as readonly string[]).includes(saved ?? "") ? (saved as Locale) : defaultLocale;

  if (applyDirection(current) && canReload) {
    // reload مرة واحدة بس لكل لغة — لو النيتف لسه مش متقلب بعدها منعلقش في loop
    if ((await readPref(RELOADED_FOR_KEY)) !== current) {
      await writePref(RELOADED_FOR_KEY, current);
      await reloadAppAsync("layout direction");
    }
  } else {
    await removePref(RELOADED_FOR_KEY);
  }
  return current;
}

/** شاشة اللغة (فريم 38): بيحفظ اللغة ويعمل reload عشان الواجهة كلها تتقلب */
export async function switchLocale(locale: Locale): Promise<void> {
  current = locale;
  await writePref(LOCALE_KEY, locale);
  applyDirection(locale);
  if (canReload) await reloadAppAsync("language change");
}
