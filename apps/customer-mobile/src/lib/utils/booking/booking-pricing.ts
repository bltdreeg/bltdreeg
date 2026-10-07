// حسابات الحجز والطابور — منقولة من BookingPricing و BookingQueueStage في Flutter (مدى الانتظار في wait-status.utils)
import type { AppliedDiscount, QueueBooking, QueueStage } from "@/lib/types/booking";
import type { SalonOffer } from "@/lib/types/offer/offer.interface";

/** وقت الحضور بعد "حان دورك" (فريم 29) */
export const TURN_GRACE_MS = 5 * 60_000;

/** كل باقة خدماتها كلها مختارة بتتطبق؛ الخدمة بتدخل في باقة واحدة بس، بترتيب الصالون */
export function quoteBooking(services: { id: string; price: number }[], offers: SalonOffer[]): { subtotal: number; discounts: AppliedDiscount[]; total: number } {
  const prices = new Map(services.map((s) => [s.id, s.price]));
  const used = new Set<string>();
  const discounts: AppliedDiscount[] = [];
  for (const o of offers) {
    const ids = o.serviceIds ?? [];
    if (o.kind !== "bundle" || o.price === undefined || !ids.length || !ids.every((id) => prices.has(id) && !used.has(id))) continue;
    const saving = ids.reduce((sum, id) => sum + prices.get(id)!, 0) - o.price;
    if (saving <= 0) continue;
    ids.forEach((id) => used.add(id));
    discounts.push({ offerId: o.id, amount: saving });
  }
  const subtotal = [...prices.values()].reduce((a, b) => a + b, 0);
  return { subtotal, discounts, total: subtotal - discounts.reduce((sum, d) => sum + d.amount, 0) };
}

export function queueStage(b: Pick<QueueBooking, "status" | "peopleAhead">): QueueStage {
  return b.status === "waiting" && b.peopleAhead <= 1 ? "approaching" : b.status;
}

export const isActive = (b: Pick<QueueBooking, "status">) => b.status === "waiting" || b.status === "yourTurn" || b.status === "upcoming" || b.status === "inService";

/** الطابور بيتحرك (بنسأل كل ٥ ثواني، الشاشة مابتطفيش) — الميعاد لأ */
export const isRunning = (b: Pick<QueueBooking, "status">) => b.status === "waiting" || b.status === "yourTurn" || b.status === "inService";

/** سواقة جوه المدينة ~١٢ كم/س من الباب للباب (زي Flutter) */
export const travelMinutes = (km: number) => Math.min(999, Math.max(1, Math.ceil(km * 5)));

export function turnTimeLeft(b: Pick<QueueBooking, "turnStartedAt">, now: number): number {
  if (!b.turnStartedAt) return 0;
  return Math.max(0, Date.parse(b.turnStartedAt) + TURN_GRACE_MS - now);
}
