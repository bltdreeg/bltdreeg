// مفاتيح React Query

export const QK_AREAS = ["areas"] as const;
export const QK_USER = ["user"] as const;
export const QK_AUTH_OPTIONS = ["auth", "options"] as const;
/** آخر تحدي OTP اتبعت لرقم/بريد معيّن — بيتحط في الكاش بعد أي إرسال وصفحة التأكيد بتقراه */
export const QK_OTP_CHALLENGE = (purpose: string, identifier: string) =>
  ["auth", "otp-challenge", purpose, identifier] as const;
export const QK_SHOPS = (filters?: unknown) => ["shops", filters ?? null] as const;
export const QK_SHOP_REVIEWS = (shopId: string) => ["shops", shopId, "reviews"] as const;
export const QK_QUEUE_STATUS = (bookingId: string) => ["bookings", bookingId, "queue-status"] as const;
