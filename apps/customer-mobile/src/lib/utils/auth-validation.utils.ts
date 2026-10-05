// أدوات التحقق لصفحات الدخول والتسجيل — مطابقة لمعايير الموبايل
import { parsePhoneNumberFromString } from "libphonenumber-js/mobile";

export interface PasswordCriteria {
  min8: boolean;
  remainingLength: number;
  hasNumber: boolean;
  isValid: boolean;
}

/**
 * التحقق من قوة كلمة السر ومتطلباتها (مطابق للموبايل: 8 حروف ورقم)
 */
export function checkPasswordCriteria(
  password: string
): PasswordCriteria {
  const min8 = password.length >= 8;
  const remainingLength = Math.max(0, 8 - password.length);
  const hasNumber = /[0-9]/.test(password);

  const isValid = min8 && hasNumber;

  return {
    min8,
    remainingLength,
    hasNumber,
    isValid,
  };
}

/**
 * التحقق من صحة البريد الإلكتروني
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

const EG_NATIONAL_LENGTH = 10;

export interface EgyptianPhoneResult {
  isValid: boolean;
  /** عدد أرقام الرقم القومي بعد شيل +20 والصفر الأول */
  digitsCount: number;
  errorMessage?: string;
  /** الصيغة اللي بتتبعت للسيرفر: +201XXXXXXXXX (بس لو الرقم صحيح) */
  e164?: string;
  /** الصيغة المحلية للعرض: 01XXXXXXXXX (بس لو الرقم صحيح) */
  local?: string;
}

/**
 * التحقق من رقم الموبايل المصري وتوحيد صيغته بـ libphonenumber-js.
 * بيقبل 01012345678 و 1012345678 و 201012345678 و +201012345678 و 00201012345678 وبأي مسافات أو شرطات.
 */
export function validateEgyptianPhone(phone: string): EgyptianPhoneResult {
  const parsed = phone.trim() ? parsePhoneNumberFromString(phone, "EG") : undefined;

  if (!parsed) {
    return { isValid: false, digitsCount: 0, errorMessage: "اكتب رقم الموبايل" };
  }

  if (parsed.countryCallingCode !== "20") {
    return {
      isValid: false,
      digitsCount: parsed.nationalNumber.length,
      errorMessage: "لازم رقم موبايل مصري (+20).",
    };
  }

  if (parsed.isValid()) {
    return {
      isValid: true,
      digitsCount: EG_NATIONAL_LENGTH,
      e164: parsed.number,
      local: `0${parsed.nationalNumber}`,
    };
  }

  const digitsCount = parsed.nationalNumber.length;

  if (digitsCount < EG_NATIONAL_LENGTH) {
    const missing = EG_NATIONAL_LENGTH - digitsCount;
    return {
      isValid: false,
      digitsCount,
      errorMessage: `الرقم ناقص ${missing === 1 ? "رقم واحد" : `${missing} أرقام`} — رقم الموبايل المصري 10 أرقام بعد +20.`,
    };
  }

  if (digitsCount > EG_NATIONAL_LENGTH) {
    return {
      isValid: false,
      digitsCount,
      errorMessage: "رقم الموبايل أطول من اللازم — رقم الموبايل المصري 10 أرقام بعد +20.",
    };
  }

  return {
    isValid: false,
    digitsCount,
    errorMessage: "رقم الموبايل غير صحيح — لازم يبدأ بـ 010 أو 011 أو 012 أو 015.",
  };
}

/** بيرجّع +201XXXXXXXXX لو الرقم موبايل مصري صحيح، وإلا null. */
export function normalizeEgyptianPhone(phone: string): string | null {
  return validateEgyptianPhone(phone).e164 ?? null;
}

/** بيرجّع 01XXXXXXXXX للعرض لو الرقم صحيح، وإلا النص زي ما هو. */
export function formatLocalEgyptianPhone(phone: string): string {
  return validateEgyptianPhone(phone).local ?? phone;
}

/** طول كود التأكيد الافتراضي (بيتغير من الـ API في challenge.codeLength) */
export const DEFAULT_OTP_LENGTH = 6;

/**
 * التحقق من كود التأكيد OTP: أرقام بس وبالطول المطلوب
 */
export function isValidOtp(code: string, length: number = DEFAULT_OTP_LENGTH): boolean {
  const trimmed = code.trim();

  return trimmed.length === length && /^[0-9]+$/.test(trimmed);
}
