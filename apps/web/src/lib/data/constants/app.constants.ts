// ثوابت عامة للتطبيق

export const APP_NAME = "بلتدريج";
export const SESSION_COOKIE = "beltadreeg_session";
/** اختيار "تصفح كزائر" — تفضيل متذكر، مش صلاحية دخول (proxy.ts بيتجاهله عمداً) */
export const GUEST_COOKIE = "beltadreeg_guest";
/** علامة مش سر: الحساب لسه ناقص خطوات onboarding — proxy.ts بيحوّل عليها من غير API call */
export const ONBOARDING_COOKIE = "beltadreeg_onboarding";
export const CALLBACK_PARAM = "callbackUrl";

export const AREA_STORAGE_KEY = "beltadreeg.area";

/** ارتفاع الهيدر الثابت أعلى الصفحة — مستخدم لحساب sticky offsets تانية */
export const HEADER_HEIGHT_PX = 60;
/** ارتفاع شريط تبويبات صفحة الصالون الثابت */
export const SALON_TABS_HEIGHT_PX = 49;
