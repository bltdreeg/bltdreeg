// ثوابت عامة للتطبيق

export const APP_NAME = "بلتدريج";
export const SESSION_COOKIE = "beltadreeg_session";
/** اختيار "تصفح كزائر" — تفضيل متذكر، مش صلاحية دخول (proxy.ts بيتجاهله عمداً) */
export const GUEST_COOKIE = "beltadreeg_guest";
export const CALLBACK_PARAM = "callbackUrl";

// ponytail: بيانات ديمو مطابقة للموبايل (FakeAuthRemoteDataSource) — تتشال لما تتعمل مصادقة حقيقية.
/** كود التأكيد في وضع الديمو — أي كود تاني بيتعامل كخطأ، زي الموبايل بالظبط */
export const DEMO_OTP = "1234";
/** عدد المحاولات الغلط قبل ما الكود يتقفل (زي maxAttempts في الموبايل) */
export const DEMO_OTP_MAX_ATTEMPTS = 3;
export const AREA_STORAGE_KEY = "beltadreeg.area";

/** ارتفاع الهيدر الثابت أعلى الصفحة — مستخدم لحساب sticky offsets تانية */
export const HEADER_HEIGHT_PX = 60;
/** ارتفاع شريط تبويبات صفحة الصالون الثابت */
export const SALON_TABS_HEIGHT_PX = 49;
