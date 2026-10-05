// شكل طلب تسجيل الدخول: بريد أو موبايل + كلمة السر
export interface LoginDto {
  identifier: string;
  password: string;
  rememberMe?: boolean;
}

/** دخول بالكود: موبايل + قناة الإرسال */
export interface OtpLoginDto {
  phone: string;
  channel?: "whatsapp" | "sms";
}

export interface SocialLoginDto {
  idToken: string;
  nonce?: string;
  firstName?: string;
  lastName?: string;
  rememberMe?: boolean;
}
