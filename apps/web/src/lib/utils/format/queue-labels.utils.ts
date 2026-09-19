// نصوص الطابور الحية — منقولة حرفياً من app_ar.arb (تطبيق الموبايل) عشان النص يطابق تمامًا
import type { QueueLoad } from "@/lib/types/queue";

/** قاعدة الجمع العربي "few" بتاعت ICU: من 3 لحد 10 */
function isFew(n: number) {
  return n >= 3 && n <= 10;
}

export function chairsActive(count: number): string {
  if (count === 1) return "كرسي واحد شغّال";
  if (count === 2) return "كرسيين شغّالين";
  return `${count} كراسي شغّالة`;
}

export function barbersOnShift(count: number): string {
  if (count === 0) return "مفيش حلاقين في الشيفت";
  if (count === 1) return "حلاق واحد في الشيفت";
  return `${count} حلاقين في الشيفت`;
}

/** حالة الطابور دلوقتي في الصالون: فاضي / فاضل كذا نفر / مقفول */
export function salonQueueTitle(isOpen: boolean, queue: QueueLoad): string {
  if (!isOpen) return "مقفول دلوقتي";
  if (queue.peopleAhead === 0) return "فاضي دلوقتي — مفيش دور";
  if (queue.waitMinutes >= 55) {
    return queue.peopleAhead === 1
      ? "فاضل 1 — استنى ~ساعة"
      : `فاضل ${queue.peopleAhead} أنفار — استنى ~ساعة`;
  }
  return queue.peopleAhead === 1
    ? `فاضل 1 — استنى ~${queue.waitMinutes} د`
    : `فاضل ${queue.peopleAhead} أنفار — استنى ~${queue.waitMinutes} د`;
}

/** دور الحلاق الفرعي: "قدامه {n} — ~{m} د" */
export function barberQueueAhead(peopleAhead: number, waitMinutes: number): string {
  return peopleAhead === 1
    ? `قدامه 1 — ~${waitMinutes} د`
    : `قدامه ${peopleAhead} — ~${waitMinutes} د`;
}

/** عدد اللي قدام الحلاق، من غير وقت الانتظار: "قدامه {n}" */
export function peopleAheadOfBarber(count: number): string {
  return `قدامه ${count}`;
}

/** الحلاق إجازة النهارده: "إجازة النهارده — بيرجع بكرة" */
export function barberOffReturns(day: string): string {
  return `إجازة النهارده — بيرجع ${day}`;
}

export function yearsExperience(count: number): string {
  if (count === 1) return "سنة خبرة";
  if (count === 2) return "سنتين خبرة";
  if (isFew(count)) return `${count} سنين خبرة`;
  return `${count} سنة خبرة`;
}

/** عدد الخدمات المختارة، بيظهر في الشريط السفلي */
export function selectionCount(count: number): string {
  if (count === 0) return "اختار خدمة";
  if (count === 1) return "خدمة واحدة";
  if (count === 2) return "خدمتين";
  if (isFew(count)) return `${count} خدمات`;
  return `${count} خدمة`;
}

export function photosCount(count: number): string {
  if (count === 1) return "صورة واحدة";
  if (count === 2) return "صورتين";
  if (isFew(count)) return `${count} صور`;
  return `${count} صورة`;
}

export function salonReviewsWithCount(count: number): string {
  return count === 1 ? "(تقييم واحد)" : `(${count} تقييم)`;
}
