// رقم الموبايل في فورم الدخول (فريم 05) — نفس قواعد Flutter (login_cubit.dart + validators.dart):
// 11 رقم بيبدأ بـ 010/011/012/015، والخطأ بيظهر inline أول ما البادئة متبقاش ممكن تبقى صح، أو الرقم يكمل 11، أو تسيب الحقل.
import { onlyDigits } from "../format/digits.utils.ts";

const EG_MOBILE = /^01[0125]\d{8}$/;

export function isEgyptianMobile(input: string): boolean {
  return EG_MOBILE.test(onlyDigits(input));
}

/** true = اعرض رسالة الخطأ تحت الحقل دلوقتي */
export function showPhoneError(input: string, blurred: boolean): boolean {
  const d = onlyDigits(input);
  if (!d) return false;
  const prefixBroken = d[0] !== "0" || (d.length >= 2 && !d.startsWith("01")) || (d.length >= 3 && !/^01[0125]/.test(d));
  return (prefixBroken || blurred || d.length >= 11) && !EG_MOBILE.test(d);
}
