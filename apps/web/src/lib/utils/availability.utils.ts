// المصدر الوحيد للمواعيد المتاحة لكل محل/تاريخ/مدة
import type { Shop } from "@/lib/types/shop/shop.interface";
import type { Slot } from "@/lib/types/slot/slot.interface";

export const Period = {
  MORNING: "morning",
  AFTERNOON: "afternoon",
  EVENING: "evening",
} as const;
export type Period = (typeof Period)[keyof typeof Period];

export const PERIOD_LABEL: Record<Period, string> = {
  [Period.MORNING]: "الصبح",
  [Period.AFTERNOON]: "بعد الضهر",
  [Period.EVENING]: "بالليل",
};

/** صباحاً قبل 12 · بعد الضهر لحد 5 · بالليل بعد كده */
export function periodOf(iso: string): Period {
  const h = new Date(iso).getHours();
  if (h < 12) return Period.MORNING;
  if (h < 17) return Period.AFTERNOON;
  return Period.EVENING;
}

/** بذرة ثابتة من الـ id عشان عدد المواعيد يفضل زي ما هو بين الرندرات */
function seedFrom(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 97;
  return h;
}

/**
 * مواعيد المحل في يوم معيّن — بتتولد من nextSlotAt بخطوة ثابتة 45 دقيقة.
 * نفس المحل ونفس اليوم بيرجّعوا نفس المواعيد دايمًا (سيرفر أو كلاينت).
 */
export function slotsForShop(shop: Shop, date: Date = new Date()): Slot[] {
  if (!shop.nextSlotAt) return [];

  const first = new Date(shop.nextSlotAt);
  if (first.toDateString() !== date.toDateString()) return [];

  const count = 2 + (seedFrom(shop.id) % 2); // 2 أو 3 مواعيد — أقصى عدد شرايح بيتحط في صف واحد
  const step = 45;

  return Array.from({ length: count }, (_, i) => {
    const t = new Date(first);
    t.setMinutes(t.getMinutes() + i * step);
    return { startAt: t.toISOString(), barberId: "أي حلاق", available: true };
  });
}

export function groupByPeriod(slots: Slot[]): Record<Period, Slot[]> {
  const out: Record<Period, Slot[]> = { morning: [], afternoon: [], evening: [] };
  for (const slot of slots) out[periodOf(slot.startAt)].push(slot);
  return out;
}

const DEFAULT_OPEN_HOUR = 10;
const DEFAULT_CLOSE_HOUR = 22;
const STEP_MINUTES = 45;

/**
 * مواعيد يوم كامل للصفحة — كل 45 دقيقة من 10 صباحاً لـ 10 مساءً.
 * المواعيد المحجوزة بتتولد بشكل ثابت عشان الـ server والـ client يتفقوا.
 * بيستبعد أي ميعاد مش هينتهي قبل الإغلاق — بيخلي فلتر المدة صادقًا.
 */
export function daySlotsForShop(
  shop: Shop,
  date: Date,
  durationMinutes: number,
): Slot[] {
  const seed = seedFrom(shop.id) + date.getDate();

  const slots: Slot[] = [];
  const start = new Date(date);
  start.setHours(DEFAULT_OPEN_HOUR, 0, 0, 0);

  const close = new Date(date);
  close.setHours(DEFAULT_CLOSE_HOUR, 0, 0, 0);

  let cursor = new Date(start);
  let idx = 0;

  while (cursor < close) {
    const end = new Date(cursor);
    end.setMinutes(end.getMinutes() + durationMinutes);

    if (end <= close) {
      // ميعاد محجوز بشكل ثابت: كل 3 مواعيد، موضعه محسوب من الـ seed
      const available = (seed + idx * 7) % 5 !== 0;
      slots.push({ startAt: cursor.toISOString(), barberId: "أي حلاق", available });
    }

    cursor = new Date(cursor);
    cursor.setMinutes(cursor.getMinutes() + STEP_MINUTES);
    idx++;
  }

  return slots;
}
