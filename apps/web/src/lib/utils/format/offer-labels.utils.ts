// نصوص العروض — منقولة حرفياً من app_ar.arb
import { formatPrice } from "@/lib/utils/format/price.utils";

export const offersHeader = "عروض شغّالة دلوقتي";

export function offerExpiresIn(days: number): string {
  if (days <= 0) return "ينتهي النهارده";
  if (days === 1) return "ينتهي بكرة";
  if (days === 2) return "ينتهي بعد يومين";
  return `ينتهي بعد ${days} أيام`;
}

export function offerBundleSaving(originalPrice: number, price: number): string {
  return `بدل ${formatPrice(originalPrice)} — توفّر ${formatPrice(originalPrice - price)}`;
}

export function offerLoyaltyProgress(visitsDone: number, visitsTarget: number): string {
  return `عندك ${visitsDone} من ${visitsTarget} زيارات`;
}

/** أيام باقية لغاية تاريخ معين، بتقريب لأسفل */
export function daysUntil(iso: string): number {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
