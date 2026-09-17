// تنسيق التاريخ والوقت بالعربي المصري
// nu-latn مهم: التصميم بيقول الأرقام لاتينية في كل حالة (6:30 م مش ٦:٣٠ م)
const LOCALE = "ar-EG-u-nu-latn";

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
}

/** يوم وشهر من غير اسم اليوم: "16 سبتمبر" */
export function formatDayMonth(iso: string) {
  return new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "long" }).format(new Date(iso));
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

export function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export function isTomorrow(iso: string) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return new Date(iso).toDateString() === t.toDateString();
}

/**
 * اليوم بيتكلم عن نفسه: النهارده · بكرة · بعد بكرة · الأحد
 * مانقولش "اليوم" ولا "غداً".
 */
export function formatDayLabel(iso: string) {
  if (isToday(iso)) return "النهارده";
  if (isTomorrow(iso)) return "بكرة";

  const days = Math.round(
    (startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime()) / 86_400_000,
  );
  if (days === 2) return "بعد بكرة";
  if (days > 2 && days < 7) {
    return new Intl.DateTimeFormat(LOCALE, { weekday: "long" }).format(new Date(iso));
  }
  return formatDayMonth(iso);
}
