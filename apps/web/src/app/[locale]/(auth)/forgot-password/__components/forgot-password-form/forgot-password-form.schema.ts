// مخطط التحقق والأنواع لنموذج استعادة كلمة السر — بدون JSX
export type ResetIdentifierMode = "email" | "phone";

export interface ForgotPasswordFormValues {
  mode: ResetIdentifierMode;
  email: string;
  phone: string;
}

export interface ForgotPasswordFormErrors {
  identifier?: string;
  general?: string;
}
