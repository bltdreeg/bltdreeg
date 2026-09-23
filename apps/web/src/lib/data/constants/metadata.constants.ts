// عناوين ووصف كل صفحة بالعربي
import type { Metadata } from "next";
import { APP_NAME } from "./app.constants";

const page = (title: string, description: string): Metadata => ({
  title: `${title} | ${APP_NAME}`,
  description,
});

export const METADATA_HOME = page("اكتشف", "احجز ميعادك في أقرب صالون حلاقة واعرف رقمك في الدور قبل ما تتحرك");
export const METADATA_SEARCH = page("البحث", "دوّر على صالونات الحلاقة في منطقتك وفلتر حسب الميعاد والسعر والتقييم");
export const METADATA_SALON = page("صفحة الصالون", "الخدمات، الحلاقين، التقييمات، والمواعيد المتاحة");
export const METADATA_FAVORITES = page("الصالونات المفضلة", "الصالونات اللي حفظتها وأقرب ميعاد متاح فيها");
export const METADATA_BOOK = page("احجز ميعاد", "اختار الخدمة والحلاق والميعاد واعرف رقمك في الدور");
export const METADATA_BOOKING_CONFIRMATION = page("تم تأكيد حجزك", "ميعادك ورقمك في الدور");
export const METADATA_BOOKINGS = page("حجوزاتي", "حجوزاتك القادمة والسابقة");
export const METADATA_BOOKING_DETAILS = page("تفاصيل الحجز", "تابع دورك لحظة بلحظة يوم الميعاد");
export const METADATA_BOOKING_RATE = page("تقييم الزيارة", "قيّم تجربتك مع الصالون والحلاق وساعد غيرك يختار صح");
export const METADATA_BOOKING_RATE_SENT = page("تم إرسال التقييم", "شكراً على تقييمك لزيارتك");
export const METADATA_ACCOUNT = page("حسابي", "بياناتك وإعدادات التطبيق");
export const METADATA_PROFILE = page("بياناتي الشخصية", "تعديل بيانات الحساب والاسم ورقم الموبايل");
export const METADATA_LANGUAGE = page("لغة التطبيق", "اختر لغة واجهة بالتدريج");
export const METADATA_HELP = page("المساعدة والدعم", "مركز مساعدة بالتدريج والأسئلة الشائعة وقنوات التواصل");
export const METADATA_LOGIN = page("تسجيل الدخول", "ادخل على حسابك في بلتدريج");
export const METADATA_REGISTER = page("إنشاء حساب", "اعمل حساب جديد واحجز في دقيقة");
export const METADATA_VERIFY_OTP = page("كود التأكيد", "أدخل الكود اللي وصلك على موبايلك");
export const METADATA_FORGOT_PASSWORD = page("نسيت كلمة السر", "هنبعتلك رابط لإعادة تعيين كلمة السر");
export const METADATA_TERMS = page("شروط الخدمة", "الشروط اللي بتنظم استخدام منصة بالتدريج");
export const METADATA_PRIVACY = page("سياسة الخصوصية", "إزاي بنجمع بياناتك ونستخدمها ونحميها");
export const METADATA_REFUND_POLICY = page("سياسة الإلغاء والاسترداد", "إزاي تلغي ميعادك وإمتى تسترد فلوسك");
export const METADATA_OFFLINE = page("النت فاصل", "مش قادرين نوصل للسيرفر — اطمن دورك متسجّل");
