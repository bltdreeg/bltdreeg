// نصوص العروض — منقولة حرفياً من app_ar.arb
import { fmt, type AppLocale } from "@/lib/utils/format/number-format.utils";

const formatPrice = (egp: number, locale: string) => fmt(locale === "en" ? "en" : "ar" as AppLocale).price(egp);

export const offersHeader = "عروض شغّالة دلوقتي";

export function offerExpiresIn(days: number, locale = "ar"): string {
  if (locale === "en") {
    if (days <= 0) return "Expires today";
    if (days === 1) return "Expires tomorrow";
    if (days === 2) return "Expires in 2 days";
    return `Expires in ${days} days`;
  }
  if (days <= 0) return "ينتهي النهارده";
  if (days === 1) return "ينتهي بكرة";
  if (days === 2) return "ينتهي بعد يومين";
  return `ينتهي بعد ${days} أيام`;
}

export function offerBundleSaving(originalPrice: number, price: number, locale = "ar"): string {
  if (locale === "en") {
    return `Instead of ${formatPrice(originalPrice, locale)} — Save ${formatPrice(originalPrice - price, locale)}`;
  }
  return `بدل ${formatPrice(originalPrice, locale)} — توفّر ${formatPrice(originalPrice - price, locale)}`;
}

export function offerLoyaltyProgress(visitsDone: number, visitsTarget: number, locale = "ar"): string {
  if (locale === "en") {
    return `You have ${visitsDone} of ${visitsTarget} visits`;
  }
  return `عندك ${visitsDone} من ${visitsTarget} زيارات`;
}

/** أيام باقية لغاية تاريخ معين، بتقريب لأسفل */
export function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
