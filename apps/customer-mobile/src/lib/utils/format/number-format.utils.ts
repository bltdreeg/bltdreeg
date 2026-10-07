// المنسّق الوحيد للأرقام في الواجهة (قاعدة التصميم): العربي بأرقام عربية-هندية ٠-٩، الإنجليزي 0-9.
// البيانات والـ API والإدخال بيفضلوا 0-9 — التحويل وقت العرض بس. الفاصلة العشرية نقطة لاتيني زي البورد (٤.٨).
// استثناء: خانات الـ OTP وحقل الموبايل بيعرضوا 0-9 في اللغتين (مش بيعدّوا من هنا).
import { formatDate, formatDayMonth, formatDayOfWeek, formatHour, formatTime as formatClock } from "./date.utils.ts";

export type AppLocale = "ar" | "en";

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const LRI = String.fromCharCode(0x2066);
const PDI = String.fromCharCode(0x2069);

/** بيحوّل أي 0-9 في النص لأرقام عربية-هندية لو اللغة عربي — للنصوص اللي فيها أرقام جاهزة */
export function localizeDigits(text: string | number, locale: AppLocale): string {
  const s = String(text);
  return locale === "ar" ? s.replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)]) : s;
}

export function fmt(locale: AppLocale) {
  const d = (v: string | number) => localizeDigits(v, locale);
  const ar = locale === "ar";
  return {
    /** نص حر فيه أرقام (عنوان عرض، تعليق زبون): "خصم 20٪" → "خصم ٢٠٪" */
    digits: d,
    /** معزول LTR جوه سطر عربي ("+٩"، "٠:٤٨") — وإلا الـ bidi بيقلب العلامة أو بيلخبط الأرقام جنب "·" */
    ltr: (text: string) => `${LRI}${d(text)}${PDI}`,
    number: (n: number) => d(Math.round(n)),
    count: (n: number) => d(Math.round(n)),
    decimal: (n: number, fractionDigits = 1) => d(n.toFixed(fractionDigits)),
    /** 4.8 → "٤.٨" */
    rating: (n: number) => d(n.toFixed(1)),
    /** 70 → "٧٠ ج.م" / "70 EGP" */
    price: (egp: number | string) => (ar ? `${d(egp)} ج.م` : `${egp} EGP`),
    /** 0.8 → "٠.٨ كم" / "0.8 km" — أقل من 10 كم بعلامة عشرية واحدة */
    distance: (km: number) => {
      const v = km < 10 ? km.toFixed(1).replace(/\.0$/, "") : String(Math.round(km));
      return ar ? `${d(v)} كم` : `${v} km`;
    },
    /** 25 → "٢٥ دقيقة" / "25 min"؛ short: "~١٥ د" بتاعة البادجات */
    minutes: (min: number, short = false) => (ar ? `${d(min)} ${short ? "د" : "دقيقة"}` : `${min} min`),
    /** "٩:٤١ م" / "9:41 PM" */
    time: (iso: string) => d(formatClock(iso, locale)),
    /** "١٢ م" — الدقايق بتظهر بس لو مش :00 ("١١:٣٠ ص") */
    hour: (iso: string) => d(new Date(iso).getMinutes() ? formatClock(iso, locale) : formatHour(iso, locale)),
    /** "الجمعة" */
    weekday: (iso: string) => formatDayOfWeek(iso, locale),
    /** "١٦ سبتمبر" */
    dayMonth: (iso: string) => d(formatDayMonth(iso, locale)),
    /** "الخميس ١٨ سبتمبر" */
    date: (iso: string) => d(formatDate(iso, locale)),
    /** موبايل للعرض في النص: "٠١٠٢ ٣٤٥ ٦٧٨٩" (حقل الإدخال نفسه بيفضل 0-9).
     *  معزول LTR (زي Flutter) ومسافات مش بتتكسر — وإلا الـ bidi بيقلب ترتيب المجموعات والسطر بيقطع الرقم (OTP على 360) */
    phone: (local: string) => {
      const p = local.replace(/\D/g, "");
      return `⁦${d(p.length === 11 ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p)}⁩`;
    },
    /** "٠٠:٣٨" للعدادات (ثواني) */
    countdown: (seconds: number) => {
      const s = Math.max(0, Math.ceil(seconds));
      return d(`${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`);
    },
  };
}
