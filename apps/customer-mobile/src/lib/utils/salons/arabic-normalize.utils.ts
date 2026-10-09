// توحيد الكتابة العربية للبحث: "الدهّان" = "الدهان"، "دجله" = "دجلة" — منقول من SalonMatcher.normalize في Flutter
import { toLatinDigits } from "../format/digits.utils.ts";

export function normalizeArabic(input: string): string {
  return toLatinDigits(input)
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/\s+/g, " ")
    .trim();
}
