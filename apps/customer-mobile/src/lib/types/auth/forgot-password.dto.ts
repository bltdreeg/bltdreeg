// استعادة كلمة السر: طلب الكود ← تأكيده ← كلمة سر جديدة
export interface ForgotPasswordDto {
  identifier: string;
  channel?: "whatsapp" | "sms" | "email";
}

export interface VerifyResetCodeDto {
  identifier: string;
  code: string;
}

export interface ResetToken {
  resetToken: string;
  expiresAt: string;
}

export interface ResetPasswordDto {
  resetToken: string;
  password: string;
  passwordConfirmation: string;
}
