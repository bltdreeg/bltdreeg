// شكل طلب إنشاء حساب
export interface RegisterDto {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  acceptedTerms: boolean;
  channel?: "whatsapp" | "sms";
}
