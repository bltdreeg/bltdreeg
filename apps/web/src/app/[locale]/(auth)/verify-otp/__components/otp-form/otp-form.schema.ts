// مخطط التحقق والأنواع لنموذج كود التأكيد — بدون JSX
export interface OtpFormValues {
  code: string;
  phone: string;
}

export interface OtpFormState {
  digits: string[];
  error?: string;
  isSubmitting: boolean;
  secondsRemaining: number;
  resendSuccess: boolean;
  callRequested: boolean;
}
