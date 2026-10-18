// طلبات أمان الحساب من صفحة بياناتي: كلمة السر، تغيير الموبايل، تأكيد البريد

/** currentPassword مطلوبة بس لو الحساب عنده كلمة سر (hasPassword) */
export interface UpdatePasswordDto {
  currentPassword?: string;
  password: string;
  passwordConfirmation: string;
}

export interface SendPhoneChangeOtpDto {
  /** +201XXXXXXXXX */
  phone: string;
  channel?: "whatsapp" | "sms";
}

export interface VerifyPhoneChangeDto {
  phone: string;
  code: string;
}

export interface VerifyEmailDto {
  code: string;
}
