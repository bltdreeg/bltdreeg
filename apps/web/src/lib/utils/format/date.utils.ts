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

export function formatDayOfWeek(iso: string) {
  return new Intl.DateTimeFormat(LOCALE, { weekday: "long" }).format(new Date(iso));
}

export function getRelativeDayLabel(iso: string) {
  const days = Math.round(
    (startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime()) / 86_400_000,
  );
  if (days === 0) return "النهارده";
  if (days === 1) return "بكرة";
  if (days === 2) return "بعد يومين";
  if (days >= 3 && days <= 10) return `بعد ${days} أيام`;
  if (days > 10) return `بعد ${days} يوم`;
  if (days === -1) return "امبارح";
  if (days === -2) return "من يومين";
  if (days < -2) return `من ${Math.abs(days)} يوم`;
  return "";
}

/**
 * تنسيق تفصيلي لتذكرة الحجز: "السبت 19 سبتمبر · بعد يومين"
 */
export function formatBookingDetailDate(iso: string) {
  const dateFormatted = formatDate(iso).replace("،", "");
  const relative = getRelativeDayLabel(iso);
  return relative ? `${dateFormatted} · ${relative}` : dateFormatted;
}

/**
 * حساب نافذة الميعاد: "50 دقيقة · من 6:30 م لحد 7:20 م"
 */
export function calculateAppointmentWindow(startIso: string, durationMinutes: number) {
  const startDate = new Date(startIso);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);
  const startFormatted = formatTime(startIso);
  const endFormatted = formatTime(endDate.toISOString());

  return {
    start: startFormatted,
    end: endFormatted,
    text: `${durationMinutes} دقيقة · من ${startFormatted} لحد ${endFormatted}`,
  };
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

/**
 * حساب وقت التحرك الموصى به: مثلاً قبل الميعاد بـ 20 دقيقة
 */
export function calculateDepartureTime(startIso: string, travelMinutes = 20) {
  const depDate = new Date(new Date(startIso).getTime() - travelMinutes * 60_000);
  return formatTime(depDate.toISOString());
}

/**
 * حساب الدقائق المتبقية حتى الميعاد
 */
export function calculateRemainingMinutes(targetIso: string, fromDate = new Date()) {
  const diffMs = new Date(targetIso).getTime() - fromDate.getTime();
  return Math.max(0, Math.round(diffMs / 60_000));
}


