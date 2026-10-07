// قاعدة الأرقام: التطبيق بيعرض 0-9 دايماً حتى بالعربي (زي digits.dart في Flutter).
// الكيبورد العربي بيكتب ٠-٩ — الموبايل والـ OTP بيتنضفوا هنا قبل أي تحقق.

/** ٠-٩ و ۰-۹ → 0-9، و ٫ → . و ٬ → , */
export function toLatinDigits(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/٫/g, ".")
    .replace(/٬/g, ",");
}

/** أرقام بس، بعد التحويل — للموبايل والـ OTP */
export function onlyDigits(input: string): string {
  return toLatinDigits(input).replace(/\D/g, "");
}
