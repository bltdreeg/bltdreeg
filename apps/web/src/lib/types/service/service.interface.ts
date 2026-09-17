// نوع الخدمة
export interface Service {
  id: string;
  shopId: string;
  name: string;
  durationMinutes: 20 | 30 | 45 | 60;
  price: number;
}
