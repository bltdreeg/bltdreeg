// كل مسارات الصفحات كثوابت — ممنوع كتابة الروابط كنصوص في أي مكان تاني

export const ROUTE_HOME = "/";
export const ROUTE_SEARCH = "/search";
export const ROUTE_FAVORITES = "/favorites";
export const ROUTE_BOOKINGS = "/bookings";
export const ROUTE_ACCOUNT = "/account";
export const ROUTE_BOOK_ROOT = "/book";
export const ROUTE_PARTNER = "/partner";

export const ROUTE_LOGIN = "/login";
export const ROUTE_REGISTER = "/register";
export const ROUTE_VERIFY_OTP = "/verify-otp";
export const ROUTE_FORGOT_PASSWORD = "/forgot-password";

export const ROUTE_SALON_ROOT = "/salon";
export const ROUTE_SALON = (id: string) => `${ROUTE_SALON_ROOT}/${id}`;
export const ROUTE_BOOK = (salonId: string) => `${ROUTE_BOOK_ROOT}/${salonId}`;
export const ROUTE_BOOK_SLOT = (salonId: string) => `${ROUTE_BOOK(salonId)}/slot`;
export const ROUTE_BOOK_BARBER = (salonId: string) => `${ROUTE_BOOK(salonId)}/barber`;
export const ROUTE_BOOK_REVIEW = (salonId: string) => `${ROUTE_BOOK(salonId)}/review`;
export const ROUTE_BOOKING_DETAILS = (id: string) => `${ROUTE_BOOKINGS}/${id}`;
export const ROUTE_BOOKING_CONFIRMATION = (salonId: string, bookingId: string) =>
  `${ROUTE_BOOK_ROOT}/${salonId}/confirmation/${bookingId}`;
