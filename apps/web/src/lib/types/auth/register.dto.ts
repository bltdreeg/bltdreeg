// شكل طلب إنشاء حساب
export interface RegisterDto {
  name: string;
  phone: string;
  email?: string;
  password: string;
  acceptedTerms: boolean;
}
