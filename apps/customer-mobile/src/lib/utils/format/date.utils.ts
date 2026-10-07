// تنسيق التاريخ والوقت بالعربي المصري والإنجليزي
// nu-latn مهم: التصميم بيقول الأرقام لاتينية في كل حالة (6:30 م مش ٦:٣٠ م)
const AR_LOCALE = "ar-EG-u-nu-latn";
const EN_LOCALE = "en-US";

function getIntlLocale(locale: string) {
  return locale === "en" ? EN_LOCALE : AR_LOCALE;
}

export function formatTime(iso: string, locale = "ar") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), { hour: "numeric", minute: "2-digit" }).format(new Date(iso));
}

/** الساعة من غير دقايق: "12 م" */
export function formatHour(iso: string, locale = "ar") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), { hour: "numeric" }).format(new Date(iso));
}

export function formatDate(iso: string, locale = "ar") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), { weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));
}

/** يوم وشهر من غير اسم اليوم: "16 سبتمبر" */
export function formatDayMonth(iso: string, locale = "ar") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), { day: "numeric", month: "long" }).format(new Date(iso));
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

export function formatDayOfWeek(iso: string, locale = "ar") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), { weekday: "long" }).format(new Date(iso));
}

export function getRelativeDayLabel(iso: string, locale = "ar") {
  const days = Math.round(
    (startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime()) / 86_400_000,
  );
  if (locale === "en") {
    if (days === 0) return "Today";
    if (days === 1) return "Tomorrow";
    if (days === 2) return "In 2 days";
    if (days >= 3 && days <= 10) return `In ${days} days`;
    if (days > 10) return `In ${days} days`;
    if (days === -1) return "Yesterday";
    if (days === -2) return "2 days ago";
    if (days < -2) return `${Math.abs(days)} days ago`;
    return "";
  }
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
export function formatBookingDetailDate(iso: string, locale = "ar") {
  const dateFormatted = formatDate(iso, locale).replace("،", "");
  const relative = getRelativeDayLabel(iso, locale);
  return relative ? `${dateFormatted} · ${relative}` : dateFormatted;
}

/**
 * حساب نافذة الميعاد: بداية ونهاية منسقتين حسب اللغة.
 * النص الكامل ("50 دقيقة · من 6:30 م لحد 7:20 م") بيتبني في المكوّن
 * عن طريق common.dateTime.appointmentWindow عشان يتترجم صح.
 */
export function calculateAppointmentWindow(startIso: string, durationMinutes: number, locale = "ar") {
  const startDate = new Date(startIso);
  const endDate = new Date(startDate.getTime() + durationMinutes * 60_000);

  return {
    start: formatTime(startIso, locale),
    end: formatTime(endDate.toISOString(), locale),
  };
}

/**
 * اليوم بيتكلم عن نفسه: النهارده · بكرة · بعد بكرة · الأحد
 * مانقولش "اليوم" ولا "غداً".
 */
export function formatDayLabel(iso: string, locale = "ar") {
  if (locale === "en") {
    if (isToday(iso)) return "Today";
    if (isTomorrow(iso)) return "Tomorrow";
    const days = Math.round(
      (startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime()) / 86_400_000,
    );
    if (days === 2) return "In 2 days";
    if (days > 2 && days < 7) {
      return new Intl.DateTimeFormat(EN_LOCALE, { weekday: "long" }).format(new Date(iso));
    }
    return formatDayMonth(iso, "en");
  }

  if (isToday(iso)) return "النهارده";
  if (isTomorrow(iso)) return "بكرة";

  const days = Math.round(
    (startOfDay(new Date(iso)).getTime() - startOfDay(new Date()).getTime()) / 86_400_000,
  );
  if (days === 2) return "بعد بكرة";
  if (days > 2 && days < 7) {
    return new Intl.DateTimeFormat(AR_LOCALE, { weekday: "long" }).format(new Date(iso));
  }
  return formatDayMonth(iso, "ar");
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


