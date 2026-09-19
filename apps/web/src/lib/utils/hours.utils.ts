import type { SalonDetails } from "@/lib/types/salon";

/** هل الصالون مفتوح دلوقتي حسب مواعيد العمل؟ */
export function isOpenNow(hours: SalonDetails["hours"]): boolean {
  const now = new Date();
  const todayEntry = hours[now.getDay()];
  if (!todayEntry?.open || !todayEntry?.close) return false;
  const [oh, om] = todayEntry.open.split(":").map(Number);
  const [ch, cm] = todayEntry.close.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;
}
