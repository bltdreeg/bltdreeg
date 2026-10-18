// مفاتيح React Query

export const QK_USER = ["user"] as const;
/** مفصول عن QK_USER عن قصد: invalidate للمستخدم بيطابق بالبادئة وكان هيعيد طلب إذن الموقع */
export const QK_LOCATION_PREFILL = ["location-prefill"] as const;
export const QK_GEO_GOVERNORATES = ["geo", "governorates"] as const;
export const QK_GEO_CITIES = (governorateId: string | null) => ["geo", "cities", governorateId] as const;
export const QK_AUTH_OPTIONS = ["auth", "options"] as const;
/** آخر تحدي OTP اتبعت لرقم/بريد معيّن — بيتحط في الكاش بعد أي إرسال وصفحة التأكيد بتقراه */
export const QK_OTP_CHALLENGE = (purpose: string, identifier: string) =>
  ["auth", "otp-challenge", purpose, identifier] as const;
export const QK_SHOPS = (filters?: unknown) => ["shops", filters ?? null] as const;
export const QK_SHOP_REVIEWS = (shopId: string) => ["shops", shopId, "reviews"] as const;
/** موقع الزائر من المتصفح — مفصول عن QK_LOCATION_PREFILL (ده بتاع الأونبوردنج وبيطلب estimate لازمه login) */
export const QK_VISITOR_POSITION = ["visitor-position"] as const;
/** null = الترتيب من الـ IP؛ لما الإحداثيات توصل المفتاح بيتغير والقائمة بتتجاب تاني */
export const QK_NEARBY_BRANCHES = (position: { lat: number; lng: number } | null) =>
  ["branches", "nearby", position ? `${position.lat},${position.lng}` : "ip"] as const;
export const QK_BRANCH_FEED = (filters: object, position: { lat: number; lng: number } | null) =>
  ["branches", "feed", filters, position ? `${position.lat},${position.lng}` : "ip"] as const;
export const QK_BRANCH = (id: string) => ["branches", "detail", id] as const;
export const QK_BRANCH_BARBERS = (branchId: string) => ["branches", branchId, "barbers"] as const;
export const QK_CHAIR_SLOTS = (branchId: string, chairId: string) => ["branches", branchId, "chairs", chairId, "slots"] as const;
/** بادئة قوايم حجوزاتي (القادمة واللي خلصت) — بعد أي حجز/إلغاء بنعمل لها invalidate */
export const QK_RESERVATION_LISTS = ["reservations", "list"] as const;
export const QK_RESERVATIONS = (scope: string) => [...QK_RESERVATION_LISTS, scope] as const;
export const QK_RESERVATION = (id: string) => ["reservations", "detail", id] as const;
