// مخطط التحقق والأنواع لنموذج تسجيل الدخول — بدون JSX
export type LoginTab = "email" | "phone";

export interface LoginFormValues {
  tab: LoginTab;
  email: string;
  phone: string;
  password: string;
}

export interface LoginFormErrors {
  identifier?: string;
  password?: string;
  general?: string;
}
