// شكل الجلسة اللي المتصفح بيشوفها — التوكن في كوكي httpOnly ومبيتبعتش هنا
import type { Customer } from "./customer.interface";

export interface AuthSession {
  user: Customer;
}
