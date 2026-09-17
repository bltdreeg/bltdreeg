// شكل طلب تسجيل الدخول: بريد أو موبايل + كلمة السر
export interface LoginDto {
  identifier: string;
  password: string;
}
