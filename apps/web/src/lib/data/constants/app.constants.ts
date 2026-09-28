// ثوابت عامة للتطبيق

/** اسم التطبيق: بلتدريج بالعربي، bltdreeg بالإنجليزي — استخدم getAppName(locale) في أي مكان فيه لغة */
export const APP_NAME = "بلتدريج";
export const APP_NAME_EN = "bltdreeg";

export function getAppName(locale: string) {
  return locale === "en" ? APP_NAME_EN : APP_NAME;
}
/** روابط المتاجر — مصدر واحد، تتغيّر من هنا بس */
export const APP_STORE_URL = "https://apps.apple.com/app/id6813227521";
export const GOOGLE_PLAY_URL = "https://play.google.com/store/apps/details?id=app.kansel";
/** أقل إصدار وحجم التطبيق — بيتعرضوا في صفحة التحميل */
export const IOS_MIN_VERSION = "15";
export const ANDROID_MIN_VERSION = "8";
export const IOS_APP_SIZE_MB = 28;
export const ANDROID_APP_SIZE_MB = 24;

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
