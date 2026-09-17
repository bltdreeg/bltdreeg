// مفاتيح React Query

export const QK_AREAS = ["areas"] as const;
export const QK_SHOPS = (filters?: unknown) => ["shops", filters ?? null] as const;
export const QK_SHOP_REVIEWS = (shopId: string) => ["shops", shopId, "reviews"] as const;
export const QK_QUEUE_STATUS = (bookingId: string) => ["bookings", bookingId, "queue-status"] as const;
