// مفاتيح React Query

export const QK_AREAS = ["areas"] as const;
export const QK_USER = ["user"] as const;
/** مفصول عن QK_USER عن قصد: invalidate للمستخدم بيطابق بالبادئة وكان هيعيد طلب إذن الموقع */
export const QK_LOCATION_PREFILL = ["location-prefill"] as const;
export const QK_GEO_GOVERNORATES = ["geo", "governorates"] as const;
export const QK_GEO_CITIES = (governorateId: string | null) => ["geo", "cities", governorateId] as const;
export const QK_GEO_AREAS = (cityId: string | null) => ["geo", "areas", cityId] as const;
export const QK_AUTH_OPTIONS = ["auth", "options"] as const;
/** آخر تحدي OTP اتبعت لرقم/بريد معيّن — بيتحط في الكاش بعد أي إرسال وصفحة التأكيد بتقراه */
export const QK_OTP_CHALLENGE = (purpose: string, identifier: string) =>
  ["auth", "otp-challenge", purpose, identifier] as const;
export const QK_SHOPS = (filters?: unknown) => ["shops", filters ?? null] as const;
export const QK_SHOP_REVIEWS = (shopId: string) => ["shops", shopId, "reviews"] as const;
export const QK_QUEUE_STATUS = (bookingId: string) => ["bookings", bookingId, "queue-status"] as const;
/** موقع الزائر من المتصفح — مفصول عن QK_LOCATION_PREFILL (ده بتاع الأونبوردنج وبيطلب estimate لازمه login) */
export const QK_VISITOR_POSITION = ["visitor-position"] as const;
/** null = الترتيب من الـ IP؛ لما الإحداثيات توصل المفتاح بيتغير والقائمة بتتجاب تاني */
export const QK_NEARBY_BRANCHES = (position: { lat: number; lng: number } | null) =>
  ["branches", "nearby", position ? `${position.lat},${position.lng}` : "ip"] as const;
