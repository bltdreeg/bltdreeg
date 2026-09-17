// شكل الجلسة بعد تسجيل الدخول
export interface AuthSession {
  userId: string;
  name: string;
  phone: string;
  accessToken: string;
  expiresAt: string;
}
