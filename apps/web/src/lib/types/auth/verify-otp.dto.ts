// شكل طلب تأكيد الكود (تسجيل جديد أو دخول بالكود)
export interface VerifyOtpDto {
  phone: string;
  code: string;
  purpose: "register" | "login";
  rememberMe?: boolean;
}

export interface ResendOtpDto {
  phone?: string;
  email?: string;
  purpose: "register" | "login" | "reset_password";
  channel?: "whatsapp" | "sms" | "email";
}
