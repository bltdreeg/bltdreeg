// مخطط التحقق والأنواع لنموذج إنشاء حساب — بدون JSX
export interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  agreeToTerms: boolean;
}

export interface RegisterFormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  agreeToTerms?: string;
  /** خطأ مش مربوط بحقل (شبكة، حد أقصى للإرسال...) */
  general?: string;
}
