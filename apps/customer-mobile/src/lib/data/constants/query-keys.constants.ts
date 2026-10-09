// مفاتيح React Query

export const QK_AREAS = ["areas"] as const;
export const QK_USER = ["user"] as const;
export const QK_AUTH_OPTIONS = ["auth", "options"] as const;
/** آخر تحدي OTP اتبعت لرقم/بريد معيّن — بيتحط في الكاش بعد أي إرسال وصفحة التأكيد بتقراه */
export const QK_OTP_CHALLENGE = (purpose: string, identifier: string) =>
  ["auth", "otp-challenge", purpose, identifier] as const;
/** صالونات منطقة بحالة الطابور الحية */
export const QK_CATALOG = (areaId: string) => ["areas", areaId, "salons"] as const;
/** صفحة صالون كاملة (خدمات، حلاقين، تقييمات…) بالطابور الحي */
export const QK_SALON = (salonId: string) => ["salons", salonId] as const;
export const QK_FAVORITES = ["favorites"] as const;
export const QK_SHOPS = (filters?: unknown) => ["shops", filters ?? null] as const;
export const QK_SHOP_REVIEWS = (shopId: string) => ["shops", shopId, "reviews"] as const;
export const QK_QUEUE_STATUS = (bookingId: string) => ["bookings", bookingId, "queue-status"] as const;
/** حجز طابور واحد بحالته الحية */
export const QK_BOOKING = (bookingId: string) => ["bookings", bookingId] as const;
/** مواعيد يوم في صالون على قد مدة الخدمات */
export const QK_SLOTS = (salonId: string, day: string, minutes: number) => ["salons", salonId, "slots", day, minutes] as const;
/** حجوزاتي (الحالية والسابقة) */
export const QK_MY_BOOKINGS = ["me", "bookings"] as const;
/** الإشعارات (فريم 32) */
export const QK_NOTIFICATIONS = ["me", "notifications"] as const;
