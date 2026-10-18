// عرض مواعيد الدخول: اليوم والساعة جايين من الـ API بتوقيت مصر (مش بتوقيت جهاز العميل)
export const SALON_TIMEZONE = "Africa/Cairo";

const intlLocale = (locale: string) => (locale === "en" ? "en-US" : "ar-EG-u-nu-latn");

/** YYYY-MM-DD النهارده في مصر */
export function cairoToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: SALON_TIMEZONE }).format(now);
}

function addDays(day: string, days: number): string {
  const date = new Date(`${day}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export type DayLabel = { kind: "today" | "tomorrow" } | { kind: "date"; label: string };

/** النهارده / بكرة / اسم اليوم والتاريخ */
export function slotDayLabel(day: string, locale: string, now: Date = new Date()): DayLabel {
  const today = cairoToday(now);
  if (day === today) return { kind: "today" };
  if (day === addDays(today, 1)) return { kind: "tomorrow" };
  const label = new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(`${day}T12:00:00Z`));
  return { kind: "date", label };
}

/** "18:30" → "6:30 م" / "6:30 PM" */
export function formatClock(time: string, locale: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? (locale === "en" ? "PM" : "م") : locale === "en" ? "AM" : "ص";
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** لحظة (ISO) → الساعة بتوقيت مصر */
export function formatInstantClock(iso: string, locale: string): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: SALON_TIMEZONE,
  }).format(new Date(iso));
  return formatClock(parts, locale);
}

/** لحظة (ISO) → اليوم بتوقيت مصر YYYY-MM-DD */
export function instantCairoDay(iso: string): string {
  return cairoToday(new Date(iso));
}
