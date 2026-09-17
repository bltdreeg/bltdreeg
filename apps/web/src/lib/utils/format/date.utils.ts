// تنسيق التاريخ والوقت بالعربي المصري
const LOCALE = "ar-EG";

export function formatTime(iso: string) {
  return new Intl.DateTimeFormat(LOCALE, { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat(LOCALE, { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
}

export function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}
