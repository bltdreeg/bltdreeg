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
export const ROUTE_RESET_PASSWORD = "/reset-password";
export const ROUTE_ONBOARDING = "/onboarding";

export const ROUTE_SALON_ROOT = "/salon";
export const ROUTE_SALON = (id: string) => `${ROUTE_SALON_ROOT}/${id}`;
export const ROUTE_BOOK = (salonId: string) => `${ROUTE_BOOK_ROOT}/${salonId}`;
export const ROUTE_BOOK_SLOT = (salonId: string) => `${ROUTE_BOOK(salonId)}/slot`;
export const ROUTE_BOOK_BARBER = (salonId: string) => `${ROUTE_BOOK(salonId)}/barber`;
export const ROUTE_BOOK_REVIEW = (salonId: string) => `${ROUTE_BOOK(salonId)}/review`;
export const ROUTE_BOOKING_DETAILS = (id: string) => `${ROUTE_BOOKINGS}/${id}`;
export const ROUTE_BOOKING_RATE = (id: string) => `${ROUTE_BOOKINGS}/${id}/rate`;
export const ROUTE_BOOKING_RATE_SENT = (id: string) => `${ROUTE_BOOKINGS}/${id}/rate/sent`;
export const ROUTE_ACCOUNT_PROFILE = `${ROUTE_ACCOUNT}/profile`;
export const ROUTE_ACCOUNT_LANGUAGE = `${ROUTE_ACCOUNT}/language`;
export const ROUTE_ACCOUNT_HELP = `${ROUTE_ACCOUNT}/help`;
export const ROUTE_BOOKING_CONFIRMATION = (salonId: string, bookingId: string) =>
  `${ROUTE_BOOK_ROOT}/${salonId}/confirmation/${bookingId}`;
export const ROUTE_OFFLINE = "/offline";

export const ROUTE_TERMS = "/terms";
export const ROUTE_PRIVACY = "/privacy";
export const ROUTE_REFUND_POLICY = "/refund-policy";

// لوحة الصالونات تطبيق منفصل (tenant-app) على دومين تاني — روابط خارجية مش مسارات next-intl
export const SALON_PANEL_URL = (process.env.NEXT_PUBLIC_SALON_PANEL_URL ?? "http://localhost:8010").replace(/\/$/, "");
export const EXTERNAL_SALON_REGISTER = `${SALON_PANEL_URL}/register`;
export const EXTERNAL_SALON_LOGIN = `${SALON_PANEL_URL}/login`;
