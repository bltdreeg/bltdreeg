// نصوص الطابور الحية — منقولة حرفياً من app_ar.arb (تطبيق الموبايل) عشان النص يطابق تمامًا
import type { QueueLoad } from "@/lib/types/queue";

/** قاعدة الجمع العربي "few" بتاعت ICU: من 3 لحد 10 */
function isFew(n: number) {
  return n >= 3 && n <= 10;
}

export function chairsActive(count: number, locale = "ar"): string {
  if (locale === "en") return count === 1 ? "1 chair active" : `${count} chairs active`;
  if (count === 1) return "كرسي واحد شغّال";
  if (count === 2) return "كرسيين شغّالين";
  return `${count} كراسي شغّالة`;
}

export function barbersOnShift(count: number, locale = "ar"): string {
  if (locale === "en") {
    if (count === 0) return "No barbers on shift";
    if (count === 1) return "1 barber on shift";
    return `${count} barbers on shift`;
  }
  if (count === 0) return "مفيش حلاقين في الشيفت";
  if (count === 1) return "حلاق واحد في الشيفت";
  return `${count} حلاقين في الشيفت`;
}

/** حالة الطابور دلوقتي في الصالون: فاضي / فاضل كذا نفر / مقفول */
export function salonQueueTitle(isOpen: boolean, queue: QueueLoad, locale = "ar"): string {
  if (locale === "en") {
    if (!isOpen) return "Closed now";
    if (queue.peopleAhead === 0) return "Available now — no queue";
    if (queue.waitMinutes >= 55) {
      return queue.peopleAhead === 1 ? "1 ahead — wait ~1 hr" : `${queue.peopleAhead} ahead — wait ~1 hr`;
    }
    return queue.peopleAhead === 1 ? `1 ahead — wait ~${queue.waitMinutes}m` : `${queue.peopleAhead} ahead — wait ~${queue.waitMinutes}m`;
  }
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
export function barberQueueAhead(peopleAhead: number, waitMinutes: number, locale = "ar"): string {
  if (locale === "en") return `${peopleAhead} ahead — ~${waitMinutes}m`;
  return peopleAhead === 1
    ? `قدامه 1 — ~${waitMinutes} د`
    : `قدامه ${peopleAhead} — ~${waitMinutes} د`;
}

/** عدد اللي قدام الحلاق، من غير وقت الانتظار: "قدامه {n}" */
export function peopleAheadOfBarber(count: number, locale = "ar"): string {
  if (locale === "en") return `${count} ahead`;
  return `قدامه ${count}`;
}

/** الحلاق إجازة النهارده: "إجازة النهارده — بيرجع بكرة" */
export function barberOffReturns(day: string, locale = "ar"): string {
  if (locale === "en") return `Off today — returns ${day}`;
  return `إجازة النهارده — بيرجع ${day}`;
}

export function yearsExperience(count: number, locale = "ar"): string {
  if (locale === "en") return `${count} ${count === 1 ? "year" : "years"} experience`;
  if (count === 1) return "سنة خبرة";
  if (count === 2) return "سنتين خبرة";
  if (isFew(count)) return `${count} سنين خبرة`;
  return `${count} سنة خبرة`;
}

/** عدد الخدمات المختارة، بيظهر في الشريط السفلي */
export function selectionCount(count: number, locale = "ar"): string {
  if (locale === "en") {
    if (count === 0) return "Select service";
    return `${count} ${count === 1 ? "service" : "services"}`;
  }
  if (count === 0) return "اختار خدمة";
  if (count === 1) return "خدمة واحدة";
  if (count === 2) return "خدمتين";
  if (isFew(count)) return `${count} خدمات`;
  return `${count} خدمة`;
}

export function photosCount(count: number, locale = "ar"): string {
  if (locale === "en") return `${count} ${count === 1 ? "photo" : "photos"}`;
  if (count === 1) return "صورة واحدة";
  if (count === 2) return "صورتين";
  if (isFew(count)) return `${count} صور`;
  return `${count} صورة`;
}

export function salonReviewsWithCount(count: number, locale = "ar"): string {
  if (locale === "en") return `(${count} ${count === 1 ? "review" : "reviews"})`;
  return count === 1 ? "(تقييم واحد)" : `(${count} تقييم)`;
}
