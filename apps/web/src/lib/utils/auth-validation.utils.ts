// أدوات التحقق لصفحات الدخول والتسجيل — مطابقة لمعايير الموبايل

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

/**
 * التحقق من رقم الموبايل المصري (10 أرقام بعد +20 يبدأ بـ 1)
 */
export function validateEgyptianPhone(phone: string): {
  isValid: boolean;
  digitsCount: number;
  errorMessage?: string;
} {
  const digits = phone.replace(/\D/g, "");
  // لو دخل الرقم بيبدأ بـ 01xxxxxxxx هنشيل الـ 0 في الأول
  const normalized = digits.startsWith("0") ? digits.slice(1) : digits;

  if (normalized.length === 0) {
    return { isValid: false, digitsCount: 0, errorMessage: "اكتب رقم الموبايل" };
  }

  if (normalized.length < 10) {
    const missing = 10 - normalized.length;
    return {
      isValid: false,
      digitsCount: normalized.length,
      errorMessage: `الرقم ناقص ${missing === 1 ? "رقم واحد" : `${missing} أرقام`} — رقم الموبايل المصري 10 أرقام بعد +20.`,
    };
  }

  if (normalized.length > 10) {
    return {
      isValid: false,
      digitsCount: normalized.length,
      errorMessage: "رقم الموبايل أطول من 10 أرقام بعد +20.",
    };
  }

  if (!normalized.startsWith("1")) {
    return {
      isValid: false,
      digitsCount: normalized.length,
      errorMessage: "رقم الموبايل المصري لازم يبدأ بـ 1 (مثلاً 010 أو 011 أو 012 أو 015).",
    };
  }

  return { isValid: true, digitsCount: 10 };
}

/**
 * التحقق من كود التأكيد OTP (4 أرقام) - مطابق للموبايل
 */
export function isValidOtp(code: string): boolean {
  return /^\d{4}$/.test(code.trim());
}
