// تحدي الـ OTP اللي بيرجع بعد أي إرسال كود
export type OtpChannel = "whatsapp" | "sms" | "email";
export type OtpPurpose = "register" | "login" | "reset_password" | "verify_phone" | "verify_email";

export interface OtpChallenge {
  phone: string | null;
  email: string | null;
  purpose: OtpPurpose;
  channel: OtpChannel;
  codeLength: number;
  expiresAt: string;
  resendAvailableAt: string;
  attemptsLeft: number;
}

/** خيارات المصادقة المتاحة دلوقتي (قنوات الكود ومزودو الدخول الاجتماعي) */
export interface AuthOptions {
  otpChannels: Array<"whatsapp" | "sms">;
  socialProviders: Array<"google" | "apple">;
  termsVersion: string | null;
}
