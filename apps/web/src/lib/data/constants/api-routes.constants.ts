// مسارات الـ API (route handlers) كثوابت — كل fetch يستورد من هنا.
// المصادقة والمستخدم مش هنا: بيتنادوا كـ server actions من React Query hooks (شوف apps/web/AGENTS.md).

export const API_SHOPS = "/api/shops";
export const API_SHOP = (id: string) => `/api/shops/${id}`;
export const API_SHOP_AVAILABILITY = (id: string) => `/api/shops/${id}/availability`;
export const API_SHOP_REVIEWS = (id: string) => `/api/shops/${id}/reviews`;

export const API_BOOKINGS = "/api/bookings";
export const API_BOOKING = (id: string) => `/api/bookings/${id}`;
export const API_BOOKING_QUEUE_STATUS = (id: string) => `/api/bookings/${id}/queue-status`;

export const API_FAVORITES = "/api/favorites";
export const API_FAVORITE = (shopId: string) => `/api/favorites/${shopId}`;

export const API_AREAS = "/api/areas";

export const API_USER_AREA = "/api/user/area";
