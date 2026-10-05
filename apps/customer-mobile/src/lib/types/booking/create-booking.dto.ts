// شكل طلب إنشاء حجز
export interface CreateBookingDto {
  shopId: string;
  barberId: string;
  serviceIds: string[];
  startAt: string;
}
