// كل مسارات الـ API كثوابت — كل fetch يستورد من هنا

export const API_AUTH_LOGIN = "/api/auth/login";
export const API_AUTH_REGISTER = "/api/auth/register";
export const API_AUTH_LOGOUT = "/api/auth/logout";
export const API_AUTH_REFRESH = "/api/auth/refresh";
export const API_AUTH_VERIFY_OTP = "/api/auth/verify-otp";

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

export const API_USER = "/api/user";
export const API_USER_AREA = "/api/user/area";
